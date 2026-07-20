/**
 * Helper to read and parse a stream of Newline Delimited JSON (NDJSON).
 * Handles partial lines split across multiple network chunks, multibyte character safety,
 * and parses each line into a JSON object passed to the onEvent callback.
 */
export async function readNdjsonStream<T>(
  response: Response,
  onEvent: (event: T) => void
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      // Keep the last part (which may be incomplete) in the buffer
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        let event: T;
        try {
          // Trusting the caller-supplied generic T for parsed NDJSON payloads; no runtime schema here.
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          event = JSON.parse(trimmed) as T;
        } catch (err) {
          console.error("Failed to parse NDJSON line:", trimmed, err);
          throw new Error("Invalid response format received from server");
        }
        onEvent(event);
      }
    }

    // Flush decoder and process any remaining text
    buffer += decoder.decode();
    const trimmed = buffer.trim();
    if (trimmed) {
      let event: T;
      try {
        // Trusting the caller-supplied generic T for parsed NDJSON payloads; no runtime schema here.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        event = JSON.parse(trimmed) as T;
      } catch (err) {
        console.error("Failed to parse final NDJSON line:", trimmed, err);
        throw new Error("Invalid response format received from server");
      }
      onEvent(event);
    }
  } finally {
    reader.releaseLock();
  }
}
