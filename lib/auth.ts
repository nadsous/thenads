import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret-please-change-me-32-bytes-long"
);

const COOKIE_PREFIX = "trip_session_";
const SESSION_DAYS = 30;

export async function issueTripSession(tripId: string) {
  const token = await new SignJWT({ tripId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret);

  const c = await cookies();
  c.set(`${COOKIE_PREFIX}${tripId}`, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export async function clearTripSession(tripId: string) {
  const c = await cookies();
  c.delete(`${COOKIE_PREFIX}${tripId}`);
}

export async function hasTripAccess(tripId: string): Promise<boolean> {
  const c = await cookies();
  const token = c.get(`${COOKIE_PREFIX}${tripId}`)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.tripId === tripId;
  } catch {
    return false;
  }
}
