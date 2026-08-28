import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const TOKEN_TTL_SECONDS = 60 * 60 * 24;

type JwtPayload = {
  sub: string;
  organizationId: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  iat: number;
  exp: number;
};

function secret(): string {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }
  return value;
}

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(input: string): string {
  return createHmac("sha256", secret()).update(input).digest("base64url");
}

export function createJwt(input: Omit<JwtPayload, "iat" | "exp">): string {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({ ...input, iat: now, exp: now + TOKEN_TTL_SECONDS });
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${sign(unsigned)}`;
}

export function verifyJwt(token: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");
  const headerPart = parts[0]!;
  const payloadPart = parts[1]!;
  const signaturePart = parts[2]!;

  const unsigned = `${headerPart}.${payloadPart}`;
  const expected = Buffer.from(sign(unsigned));
  const actual = Buffer.from(signaturePart);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error("Invalid token");
  }

  const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString()) as JwtPayload;
  if (typeof payload.sub !== "string" || typeof payload.organizationId !== "string" || (payload.role !== "ADMIN" && payload.role !== "MEMBER") || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Expired token");
  }
  return payload;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, salt, hash] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
