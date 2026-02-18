import { cookies } from "next/headers";
import { signJwt, verifyJwt } from "./jwt";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "session";

export async function createSession(payload: {
  id: number;
  username: string;
  role: string;
}) {
  const token = signJwt({
    sub: payload.id,
    username: payload.username,
    role: payload.role,
  });

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJwt(token);
}
