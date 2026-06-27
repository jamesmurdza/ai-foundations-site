const ITERATIONS = 100_000;

function bytesToHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function randomHex(byteLen: number): string {
  const buf = new Uint8Array(byteLen);
  crypto.getRandomValues(buf);
  return bytesToHex(buf);
}

async function pbkdf2Hex(
  password: string,
  salt: string,
  iterations: number,
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return bytesToHex(bits);
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomHex(16);
  const hash = await pbkdf2Hex(plain, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const aB = hexToBytes(a);
  const bB = hexToBytes(b);
  let diff = 0;
  for (let i = 0; i < aB.length; i++) diff |= aB[i] ^ bB[i];
  return diff === 0;
}

export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations < 1) return false;
  const candidate = await pbkdf2Hex(plain, parts[2], iterations);
  return timingSafeEqualHex(parts[3], candidate);
}

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9][a-z0-9_-]{1,29}$/.test(username);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6 && password.length <= 128;
}
