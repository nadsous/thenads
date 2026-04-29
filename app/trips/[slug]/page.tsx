import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasTripAccess } from "@/lib/auth";
import { PasswordGate } from "@/components/PasswordGate";
import { TripExperience } from "@/components/TripExperience";

export const dynamic = "force-dynamic";

export default async function TripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = await prisma.trip.findUnique({
    where: { slug },
    include: {
      days: { orderBy: { index: "asc" } },
      places: { orderBy: [{ orderInDay: "asc" }] },
    },
  });

  if (!trip) notFound();

  const allowed = await hasTripAccess(trip.id);
  if (!allowed) {
    return (
      <PasswordGate
        slug={trip.slug}
        tripName={trip.name}
        city={trip.city}
        emoji={trip.coverEmoji}
        accentFrom={trip.accentFrom}
        accentTo={trip.accentTo}
      />
    );
  }

  // Strip password hash before sending
  const safeTrip = {
    id: trip.id,
    slug: trip.slug,
    name: trip.name,
    city: trip.city,
    country: trip.country,
    coverEmoji: trip.coverEmoji,
    accentFrom: trip.accentFrom,
    accentTo: trip.accentTo,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    notes: trip.notes,
    days: trip.days.map((d) => ({
      ...d,
      date: d.date.toISOString(),
    })),
    places: trip.places,
  };

  return <TripExperience trip={safeTrip} />;
}
