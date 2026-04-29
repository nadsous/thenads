import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const trip = await prisma.trip.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const events = await prisma.tripEvent.findMany({
    where: { tripId: trip.id },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(events);
}
