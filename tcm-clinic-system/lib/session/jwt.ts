import jwt, { type SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_JWT_SECRET!;
const JWT_EXPIRES =
  (process.env.AUTH_JWT_EXPIRES as SignOptions["expiresIn"]) || "1d";

if (!process.env.AUTH_JWT_SECRET) {
  throw new Error("AUTH_JWT_SECRET is not set");
}

export type JwtPayload = {
  sub: number;
  username: string;
  role: string;
};

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
}

export function verifyJwt<T = JwtPayload>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}
