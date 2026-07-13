import { describe, expect, it } from "vitest";
import { readNdjsonStream } from "../../src/frontend/shared/api/readNdjsonStream.js";

// Helper to create a Response with a stream of chunks
function createStreamingResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
  return new Response(stream);
}

describe("readNdjsonStream", () => {
  it("parses single lines correctly", async () => {
    const response = createStreamingResponse(['{"a":1}\n', '{"b":2}\n']);
    const events: any[] = [];
    await readNdjsonStream(response, (event) => events.push(event));
    expect(events).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("handles a single line split across chunks", async () => {
    const response = createStreamingResponse(['{"a":', "1}\n"]);
    const events: any[] = [];
    await readNdjsonStream(response, (event) => events.push(event));
    expect(events).toEqual([{ a: 1 }]);
  });

  it("handles multiple lines in a single chunk", async () => {
    const response = createStreamingResponse(['{"a":1}\n{"b":2}\n']);
    const events: any[] = [];
    await readNdjsonStream(response, (event) => events.push(event));
    expect(events).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("handles multibyte characters split across chunks safely", async () => {
    // Character: 'ñ' (Unicode U+00F1, UTF-8: 0xC3 0xB1)
    const encoder = new TextEncoder();
    const bytes = encoder.encode('{"name":"ñ"}\n');
    
    // Split the UTF-8 bytes of 'ñ'
    // '{"name":"' ends at index 9
    // 'ñ' UTF-8 bytes are at index 9 (0xC3) and index 10 (0xB1)
    const part1 = bytes.slice(0, 10); // includes 0xC3
    const part2 = bytes.slice(10);    // includes 0xB1 and subsequent characters

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(part1);
        controller.enqueue(part2);
        controller.close();
      },
    });
    const response = new Response(stream);

    const events: any[] = [];
    await readNdjsonStream(response, (event) => events.push(event));
    expect(events).toEqual([{ name: "ñ" }]);
  });

  it("processes final line even if it has no trailing newline", async () => {
    const response = createStreamingResponse(['{"a":1}']);
    const events: any[] = [];
    await readNdjsonStream(response, (event) => events.push(event));
    expect(events).toEqual([{ a: 1 }]);
  });

  it("ignores empty lines", async () => {
    const response = createStreamingResponse(['{"a":1}\n\n\n{"b":2}\n']);
    const events: any[] = [];
    await readNdjsonStream(response, (event) => events.push(event));
    expect(events).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("throws an error on invalid JSON", async () => {
    const response = createStreamingResponse(['{"a":1\n']);
    const events: any[] = [];
    await expect(readNdjsonStream(response, (event) => events.push(event))).rejects.toThrow();
  });
});
