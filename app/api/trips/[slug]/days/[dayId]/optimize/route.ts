import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasTripAccess } from "@/lib/auth";
import { nearestNeighborOrder, totalWalkDistance } from "@/lib/routing";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; dayId: string }> }
) {
  const { slug, dayId } = await params;
  const trip = await prisma.trip.findUnique({ where: { slug }, select: { id: true } });
  if (!trip) return NextResponse.json({ error: "trip not found" }, { status: 404 });

  if (!(await hasTripAccess(trip.id))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const places = await prisma.place.findMany({
    where: { tripId: trip.id, dayId },
    orderBy: { orderInDay: "asc" },
  });

  if (places.length < 3) {
    return NextResponse.json({ ok: true, reordered: false, reason: "less than 3 places" });
  }

  // Anchor on the FIRST place by current order (often the opener).
  // Nearest-neighbor on the rest.
  const before = totalWalkDistance(places);
  const optimized = nearestNeighborOrder(places);
  const after = totalWalkDistance(optimized);

  // Persist new orderInDay values
  await prisma.$transaction(
    optimized.map((p, idx) =>
      prisma.place.update({
        where: { id: p.id },
        data: { orderInDay: idx },
      })
    )
  );

  return NextResponse.json({
    ok: true,
    reordered: true,
    distanceMBefore: Math.round(before),
    distanceMAfter: Math.round(after),
    savedM: Math.round(before - after),
    order: optimized.map((p) => ({ id: p.id, name: p.name })),
  });
}
