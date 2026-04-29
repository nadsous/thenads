import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasTripAccess } from "@/lib/auth";

async function ensureAuth(slug: string) {
  const trip = await prisma.trip.findUnique({ where: { slug }, select: { id: true } });
  if (!trip) return { error: NextResponse.json({ error: "trip not found" }, { status: 404 }) };
  if (!(await hasTripAccess(trip.id))) {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { tripId: trip.id };
}

const ALLOWED = [
  "name",
  "category",
  "lat",
  "lng",
  "address",
  "description",
  "humorComment",
  "tip",
  "openingHours",
  "suggestedStart",
  "suggestedEnd",
  "durationMinutes",
  "segment",
  "orderInDay",
  "mustReserve",
  "isRainyAlt",
  "isHidden",
  "emoji",
  "priceInfo",
  "crowdLevel",
  "crowdNote",
  "bookingUrl",
  "funFact",
  "dayId",
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const auth = await ensureAuth(slug);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ALLOWED) {
    if (k in body) data[k] = body[k];
  }

  const place = await prisma.place.update({
    where: { id, tripId: auth.tripId },
    data,
  });
  return NextResponse.json({ ok: true, place });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const auth = await ensureAuth(slug);
  if ("error" in auth) return auth.error;

  await prisma.place.delete({ where: { id, tripId: auth.tripId } });
  return NextResponse.json({ ok: true });
}
