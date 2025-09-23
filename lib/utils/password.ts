import { randomBytes, pbkdf2Sync, timingSafeEqual } from "crypto";

const DEFAULT_ITERATIONS = 120_000;
const KEY_LEN = 32;
const DIGEST = "sha256";

export function hashPassword(
  password: string,
  iterations: number = DEFAULT_ITERATIONS
): string {
  const salt = randomBytes(16);
  const derived = pbkdf2Sync(password, salt, iterations, KEY_LEN, DIGEST);
  return `pbkdf2$${DIGEST}$${iterations}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, digest, iterStr, saltB64, hashB64] = stored.split("$");
    if (scheme !== "pbkdf2" || digest !== DIGEST) return false;
    const iterations = parseInt(iterStr, 10);
    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(hashB64, "base64");
    const derived = pbkdf2Sync(password, salt, iterations, expected.length, digest);
    return (
      derived.length === expected.length &&
      timingSafeEqual(derived, expected)
    );
  } catch {
    return false;
  }
}
