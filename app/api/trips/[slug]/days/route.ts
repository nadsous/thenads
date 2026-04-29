import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasTripAccess } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const trip = await prisma.trip.findUnique({ where: { slug }, select: { id: true } });
  if (!trip) return NextResponse.json({ error: "trip not found" }, { status: 404 });
  if (!(await hasTripAccess(trip.id))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const last = await prisma.day.findFirst({
    where: { tripId: trip.id },
    orderBy: { index: "desc" },
    select: { index: true },
  });
  const index = (last?.index ?? -1) + 1;

  const palette = [
    ["#fb923c", "#f43f5e"],
    ["#6366f1", "#22d3ee"],
    ["#10b981", "#a3e635"],
    ["#f472b6", "#a78bfa"],
    ["#facc15", "#f97316"],
    ["#06b6d4", "#3b82f6"],
  ];
  const c = palette[index % palette.length];

  const day = await prisma.day.create({
    data: {
      tripId: trip.id,
      index,
      date: body.date ? new Date(body.date) : new Date(),
      label: body.label ?? `Jour ${index + 1}`,
      subtitle: body.subtitle ?? null,
      colorFrom: body.colorFrom ?? c[0],
      colorTo: body.colorTo ?? c[1],
      isOff: body.isOff ?? false,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json({ ok: true, day });
}
