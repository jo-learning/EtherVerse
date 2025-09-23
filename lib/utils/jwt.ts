import { createHmac, timingSafeEqual } from "crypto";

const ALG = "HS256";

// Base64 url helpers
function b64url(input: Buffer | string) {
  return (typeof input === "string" ? Buffer.from(input) : input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(data: string, secret: string) {
  return b64url(createHmac("sha256", secret).update(data).digest());
}

export function signJWT(
  payload: Record<string, any>,
  expiresInSeconds: number,
  secret = process.env.ADMIN_JWT_SECRET || "dev-insecure-secret"
): string {
  const header = { alg: ALG, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { iat: now, exp: now + expiresInSeconds, ...payload };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(body));
  const sig = sign(`${h}.${p}`, secret);
  return `${h}.${p}.${sig}`;
}

export function verifyJWT<T = any>(
  token: string,
  secret = process.env.ADMIN_JWT_SECRET || "dev-insecure-secret"
): { valid: boolean; payload?: T; reason?: string } {
  try {
    const [h, p, s] = token.split(".");
    if (!h || !p || !s) return { valid: false, reason: "malformed" };
    const expected = sign(`${h}.${p}`, secret);
    const a = Buffer.from(s);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b))
      return { valid: false, reason: "bad-signature" };
    const payload = JSON.parse(Buffer.from(p, "base64").toString());
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp)
      return { valid: false, reason: "expired" };
    return { valid: true, payload };
  } catch {
    return { valid: false, reason: "error" };
  }
}
