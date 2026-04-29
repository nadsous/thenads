import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { shortDateFr } from "@/lib/utils";
import { TripCard } from "@/components/TripCard";
import { HeroAnimated } from "@/components/HeroAnimated";
import { NewTripCard } from "@/components/NewTripCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const trips = await prisma.trip.findMany({
    orderBy: { startDate: "asc" },
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
      _count: { select: { places: true, days: true } },
    },
  });

  return (
    <main className="flex flex-col flex-1 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-24">
      <HeroAnimated />

      <section className="mt-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Mes voyages</h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              {trips.length} voyage{trips.length > 1 ? "s" : ""} planifié{trips.length > 1 ? "s" : ""}.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t, i) => (
            <TripCard
              key={t.id}
              index={i}
              slug={t.slug}
              name={t.name}
              city={t.city}
              country={t.country}
              emoji={t.coverEmoji}
              accentFrom={t.accentFrom}
              accentTo={t.accentTo}
              dateLabel={`${shortDateFr(t.startDate)} → ${shortDateFr(t.endDate)}`}
              placesCount={t._count.places}
              daysCount={t._count.days}
            />
          ))}
          <NewTripCard index={trips.length} />
        </div>
      </section>

      <section className="mt-14 flex justify-center">
        <Link
          href="/about"
          className="text-xs text-[var(--muted-2)] hover:text-[var(--muted)] transition"
        >
          Construit avec Next.js + MapLibre · Données stockées en local
        </Link>
      </section>
    </main>
  );
}
