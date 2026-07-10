import { createHash, randomInt } from "crypto";

export function hashPlayerToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generatePlayerToken(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "";
  for (let i = 0; i < 8; i += 1) token += alphabet[randomInt(0, alphabet.length)];
  return token;
}
