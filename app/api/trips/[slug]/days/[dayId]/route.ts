import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasTripAccess } from "@/lib/auth";

async function auth(slug: string) {
  const trip = await prisma.trip.findUnique({ where: { slug }, select: { id: true } });
  if (!trip) return { error: NextResponse.json({ error: "trip not found" }, { status: 404 }) };
  if (!(await hasTripAccess(trip.id))) {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { tripId: trip.id };
}

const ALLOWED = ["label", "subtitle", "date", "colorFrom", "colorTo", "isOff", "notes"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; dayId: string }> }
) {
  const { slug, dayId } = await params;
  const a = await auth(slug);
  if ("error" in a) return a.error;

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ALLOWED) if (k in body) data[k] = k === "date" ? new Date(body.date) : body[k];

  const day = await prisma.day.update({
    where: { id: dayId, tripId: a.tripId },
    data,
  });
  return NextResponse.json({ ok: true, day });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; dayId: string }> }
) {
  const { slug, dayId } = await params;
  const a = await auth(slug);
  if ("error" in a) return a.error;

  // Move places of this day to the rainy/uncategorized pool (dayId = null)
  await prisma.place.updateMany({ where: { dayId, tripId: a.tripId }, data: { dayId: null } });
  await prisma.day.delete({ where: { id: dayId, tripId: a.tripId } });
  return NextResponse.json({ ok: true });
}
