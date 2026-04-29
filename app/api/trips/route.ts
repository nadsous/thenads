import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const trips = await prisma.trip.findMany({
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      country: true,
      coverEmoji: true,
      accentFrom: true,
      accentTo: true,
      startDate: true,
      endDate: true,
    },
  });
  return NextResponse.json({ trips });
}
