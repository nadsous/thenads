import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasTripAccess } from "@/lib/auth";

// Create a new place in this trip
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
  const dayId: string | null = body.dayId ?? null;

  let orderInDay = 0;
  if (dayId) {
    const last = await prisma.place.findFirst({
      where: { tripId: trip.id, dayId },
      orderBy: { orderInDay: "desc" },
      select: { orderInDay: true },
    });
    orderInDay = (last?.orderInDay ?? -1) + 1;
  }

  const place = await prisma.place.create({
    data: {
      tripId: trip.id,
      dayId,
      name: body.name ?? "Nouveau lieu",
      category: body.category ?? "monument",
      lat: body.lat,
      lng: body.lng,
      address: body.address ?? null,
      description: body.description ?? "",
      humorComment: body.humorComment ?? "",
      tip: body.tip ?? null,
      openingHours: body.openingHours ?? null,
      suggestedStart: body.suggestedStart ?? null,
      suggestedEnd: body.suggestedEnd ?? null,
      durationMinutes: body.durationMinutes ?? null,
      segment: body.segment ?? null,
      orderInDay,
      mustReserve: body.mustReserve ?? false,
      isRainyAlt: body.isRainyAlt ?? false,
      isHidden: body.isHidden ?? false,
      emoji: body.emoji ?? "📍",
      priceInfo: body.priceInfo ?? null,
      crowdLevel: body.crowdLevel ?? null,
      crowdNote: body.crowdNote ?? null,
      bookingUrl: body.bookingUrl ?? null,
      funFact: body.funFact ?? null,
    },
  });

  return NextResponse.json({ ok: true, place });
}
