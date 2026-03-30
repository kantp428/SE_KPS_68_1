import jwt, { type SignOptions } from "jsonwebtoken";

const JWT_EXPIRES =
  (process.env.AUTH_JWT_EXPIRES as SignOptions["expiresIn"]) || "1d";

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET;

  if (!secret) {
    throw new Error("AUTH_JWT_SECRET is not set");
  }

  return secret;
}

export type JwtPayload = {
  sub: number;
  username: string;
  role: string;
};

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES,
  });
}

export function verifyJwt<T = JwtPayload>(token: string): T | null {
  try {
    return jwt.verify(token, getJwtSecret()) as T;
  } catch {
    return null;
  }
}
