"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CloudRain,
  Footprints,
  Train,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  Zap,
  Pencil,
  PencilOff,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sunrise,
  Sunset,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getSunTimes, formatTimeFr, centroid } from "@/lib/sun";
import Link from "next/link";
import { DayTimeline } from "./DayTimeline";
import { PlaceDetail } from "./PlaceDetail";
import { TripHeader } from "./TripHeader";
import { RainyPanel } from "./RainyPanel";
import { TripEventsPanel } from "./TripEventsPanel";
import { PlaceEditor } from "./PlaceEditor";
import { DayEditor } from "./DayEditor";
import {
  osrmFootLeg,
  transitLeg,
  formatDuration,
  formatDistance,
  type Leg,
} from "@/lib/routing";

const TripMap = dynamic(() => import("./TripMap").then((m) => m.TripMap), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-black/40 text-sm text-white/60">
      Chargement de la carte...
    </div>
  ),
});

export type Place = {
  id: string;
  tripId: string;
  dayId: string | null;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string | null;
  description: string;
  humorComment: string;
  tip: string | null;
  openingHours: string | null;
  suggestedStart: string | null;
  suggestedEnd: string | null;
  durationMinutes: number | null;
  segment: string | null;
  orderInDay: number;
  mustReserve: boolean;
  isRainyAlt: boolean;
  isHidden: boolean;
  emoji: string;
  priceInfo: string | null;
  crowdLevel: string | null;
  crowdNote: string | null;
  bookingUrl: string | null;
  funFact: string | null;
};

export type Day = {
  id: string;
  tripId: string;
  index: number;
  date: string;
  label: string;
  subtitle: string | null;
  colorFrom: string;
  colorTo: string;
  isOff: boolean;
  notes: string | null;
};

export type TripData = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  coverEmoji: string;
  accentFrom: string;
  accentTo: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  days: Day[];
  places: Place[];
};

export type TravelMode = "walk" | "transit";

export function TripExperience({ trip }: { trip: TripData }) {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>("walk");
  const [showHidden, setShowHidden] = useState(true);
  const [rainyOpen, setRainyOpen] = useState(false);
  const [legs, setLegs] = useState<Leg[]>([]);
  const [legsLoading, setLegsLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeMessage, setOptimizeMessage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [creatingPlaceAt, setCreatingPlaceAt] = useState<{ lat: number; lng: number } | null>(null);
  const [editingDay, setEditingDay] = useState<Day | null>(null);
  const router = useRouter();

  async function optimizeDay() {
    if (!activeDay || optimizing) return;
    setOptimizing(true);
    setOptimizeMessage(null);
    try {
      const res = await fetch(
        `/api/trips/${trip.slug}/days/${activeDay.id}/optimize`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.ok && data.reordered) {
        setOptimizeMessage(
          data.savedM > 0
            ? `−${Math.round(data.savedM / 100) * 100} m économisés 🎉`
            : "Trajet déjà optimal"
        );
      } else {
        setOptimizeMessage("Pas assez de lieux pour optimiser");
      }
      router.refresh();
    } catch {
      setOptimizeMessage("Erreur");
    } finally {
      setOptimizing(false);
      setTimeout(() => setOptimizeMessage(null), 4000);
    }
  }

  const activeDay = trip.days[activeDayIdx] ?? trip.days[0];

  // Trip city coords (approx) = centroid of all assigned places. Cached once.
  const tripCenter = useMemo(() => {
    const pts = trip.places
      .filter((p) => typeof p.lat === "number" && typeof p.lng === "number")
      .map((p) => ({ lat: p.lat, lng: p.lng }));
    return centroid(pts) ?? { lat: 47.4979, lng: 19.0537 };
  }, [trip.places]);

  const sunTimes = useMemo(() => {
    if (!activeDay) return null;
    return getSunTimes(new Date(activeDay.date), tripCenter.lat, tripCenter.lng);
  }, [activeDay, tripCenter]);

  const placesByDay = useMemo(() => {
    const map = new Map<string, Place[]>();
    for (const d of trip.days) map.set(d.id, []);
    for (const p of trip.places) {
      if (p.dayId) map.get(p.dayId)?.push(p);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.orderInDay - b.orderInDay);
    }
    return map;
  }, [trip.days, trip.places]);

  const activeDayPlaces = activeDay
    ? (placesByDay.get(activeDay.id) ?? []).filter((p) => !p.isHidden)
    : [];

  const hiddenPlaces = trip.places.filter((p) => p.isHidden);
  const rainyPlaces = trip.places.filter((p) => p.isRainyAlt);

  const selectedPlace =
    trip.places.find((p) => p.id === selectedPlaceId) ?? null;

  // When changing day, clear selection
  useEffect(() => {
    setSelectedPlaceId(null);
  }, [activeDayIdx]);

  // Compute legs (walking via OSRM, transit via OSRM car so it follows streets).
  // Uses AbortController so when the user switches day/mode quickly, in-flight
  // requests are cancelled and stale answers cannot overwrite fresh state.
  useEffect(() => {
    if (activeDayPlaces.length < 2) {
      setLegs([]);
      setLegsLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLegsLoading(true);
    // Reset any previous polyline immediately so the user doesn't see the old
    // route stitched to the new day's markers while we recompute.
    setLegs([]);

    (async () => {
      const pairs: Array<[Place, Place]> = [];
      for (let i = 0; i < activeDayPlaces.length - 1; i++) {
        pairs.push([activeDayPlaces[i], activeDayPlaces[i + 1]]);
      }
      try {
        const newLegs: Leg[] = await Promise.all(
          pairs.map(([a, b]) => {
            const A = { id: a.id, lat: a.lat, lng: a.lng };
            const B = { id: b.id, lat: b.lat, lng: b.lng };
            return travelMode === "walk"
              ? osrmFootLeg(A, B, ctrl.signal)
              : transitLeg(A, B, ctrl.signal);
          })
        );
        if (!ctrl.signal.aborted) {
          setLegs(newLegs);
          setLegsLoading(false);
        }
      } catch {
        if (!ctrl.signal.aborted) setLegsLoading(false);
      }
    })();

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay?.id, travelMode, trip.places]);

  return (
    <div className="relative flex flex-col flex-1 w-full min-h-screen">
      {/* Top bar */}
      <header className="relative z-30 flex items-center justify-between px-3 sm:px-6 pt-3 sm:pt-4 pb-1 sm:pb-2 gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition glass rounded-full px-3 py-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voyages
        </Link>

        <TripHeader trip={trip} />

        <div className="flex items-center gap-2">
          <TripEventsPanel
            slug={trip.slug}
            accentFrom={trip.accentFrom}
            accentTo={trip.accentTo}
          />
          <button
            onClick={() => setEditMode((v) => !v)}
            title={editMode ? "Quitter l'édition" : "Modifier le voyage"}
            className={`rounded-full p-2 transition ${
              editMode
                ? "bg-white text-black"
                : "glass hover:bg-white/10 text-white"
            }`}
          >
            {editMode ? <PencilOff className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setShowHidden((v) => !v)}
            title={showHidden ? "Masquer les easter eggs" : "Afficher les easter eggs"}
            className="glass rounded-full p-2 hover:bg-white/10 transition"
          >
            {showHidden ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setRainyOpen((v) => !v)}
            title="En cas de pluie"
            className="glass rounded-full p-2 hover:bg-white/10 transition"
          >
            <CloudRain className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Day pills */}
      <DayTimeline
        days={trip.days}
        activeDayIdx={activeDayIdx}
        onChange={setActiveDayIdx}
        editMode={editMode}
        onEditDay={(d) => setEditingDay(d)}
        onAddDay={async () => {
          await fetch(`/api/trips/${trip.slug}/days`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({}),
          });
          router.refresh();
        }}
      />

      {/* Walk / Transit toggle */}
      <div className="relative z-30 px-4 sm:px-6 mt-3 flex items-center gap-2">
        <div className="glass rounded-full p-1 inline-flex">
          <button
            onClick={() => setTravelMode("walk")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              travelMode === "walk"
                ? "bg-white text-black"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Footprints className="h-3.5 w-3.5" /> À pied
          </button>
          <button
            onClick={() => setTravelMode("transit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              travelMode === "transit"
                ? "bg-white text-black"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Train className="h-3.5 w-3.5" /> Transport
          </button>
        </div>

        <button
          onClick={optimizeDay}
          disabled={optimizing || activeDayPlaces.length < 3}
          title="Réordonner les lieux du jour pour réduire les détours"
          className="glass rounded-full px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-medium hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Zap className="h-3.5 w-3.5" />
          {optimizing ? "..." : "Optimiser"}
        </button>

        {optimizeMessage && (
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-emerald-300"
          >
            {optimizeMessage}
          </motion.span>
        )}

        {sunTimes && (
          <div className="glass rounded-full px-3 py-1.5 inline-flex items-center gap-2 text-xs text-white/85">
            <span className="inline-flex items-center gap-1" title="Lever du soleil">
              <Sunrise className="h-3.5 w-3.5 text-amber-300" />
              {formatTimeFr(sunTimes.sunrise)}
            </span>
            <span className="text-white/30">·</span>
            <span className="inline-flex items-center gap-1" title="Coucher du soleil">
              <Sunset className="h-3.5 w-3.5 text-rose-300" />
              {formatTimeFr(sunTimes.sunset)}
            </span>
          </div>
        )}

        {activeDay && !optimizeMessage && (
          <div className="hidden md:flex items-center gap-1.5 text-xs text-white/60">
            <Sparkles className="h-3 w-3" />
            {activeDay.subtitle ?? "Bonne journée"}
          </div>
        )}
      </div>

      {/* Map + side panel */}
      <div
        className="relative flex-1 mt-3 mx-2 sm:mx-6 mb-2 sm:mb-6 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#08070f]"
        style={{ minHeight: "min(75vh, 800px)" }}
      >
        <TripMap
          places={activeDayPlaces}
          hiddenPlaces={showHidden ? hiddenPlaces : []}
          rainyPlaces={rainyOpen ? rainyPlaces : []}
          day={activeDay}
          travelMode={travelMode}
          legs={legs}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={(id) => setSelectedPlaceId(id)}
          editMode={editMode}
          onMapClick={editMode ? (latlng) => setCreatingPlaceAt(latlng) : undefined}
        />

        {/* Bottom timeline of places (overlay) - hidden on mobile when a place is opened */}
        <div className={selectedPlaceId ? "hidden sm:block" : ""}>
          <PlacesOverlay
            places={activeDayPlaces}
            activeDay={activeDay}
            selectedPlaceId={selectedPlaceId}
            onSelect={(id) => setSelectedPlaceId(id)}
            legs={legs}
            legsLoading={legsLoading}
            travelMode={travelMode}
            editMode={editMode}
            tripSlug={trip.slug}
            onEditPlace={(p) => setEditingPlace(p)}
            onAddPlace={() => {
              const center = activeDay
                ? activeDayPlaces[0] ?? { lat: 47.4979, lng: 19.0537 }
                : { lat: 47.4979, lng: 19.0537 };
              setCreatingPlaceAt({ lat: center.lat, lng: center.lng });
            }}
            onChange={() => router.refresh()}
          />
        </div>

        {/* Place detail panel (right) */}
        <AnimatePresence>
          {selectedPlace && (
            <PlaceDetail
              place={selectedPlace}
              travelMode={travelMode}
              accentFrom={activeDay?.colorFrom ?? trip.accentFrom}
              accentTo={activeDay?.colorTo ?? trip.accentTo}
              onClose={() => setSelectedPlaceId(null)}
            />
          )}
        </AnimatePresence>

        {/* Rainy panel */}
        <AnimatePresence>
          {rainyOpen && (
            <RainyPanel
              places={rainyPlaces}
              onSelect={(id) => {
                setSelectedPlaceId(id);
                setRainyOpen(false);
              }}
              onClose={() => setRainyOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Edit modals */}
      <AnimatePresence>
        {editingPlace && (
          <PlaceEditor
            tripSlug={trip.slug}
            days={trip.days}
            place={editingPlace}
            onClose={() => setEditingPlace(null)}
            onSaved={() => {
              setEditingPlace(null);
              router.refresh();
            }}
          />
        )}
        {creatingPlaceAt && (
          <PlaceEditor
            tripSlug={trip.slug}
            days={trip.days}
            initial={{
              lat: creatingPlaceAt.lat,
              lng: creatingPlaceAt.lng,
              dayId: activeDay?.id ?? null,
              segment: "morning",
            }}
            onClose={() => setCreatingPlaceAt(null)}
            onSaved={() => {
              setCreatingPlaceAt(null);
              router.refresh();
            }}
          />
        )}
        {editingDay && (
          <DayEditor
            tripSlug={trip.slug}
            day={editingDay}
            onClose={() => setEditingDay(null)}
            onSaved={() => {
              setEditingDay(null);
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PlacesOverlay({
  places,
  activeDay,
  selectedPlaceId,
  onSelect,
  legs,
  legsLoading,
  travelMode,
  editMode,
  tripSlug,
  onEditPlace,
  onAddPlace,
  onChange,
}: {
  places: Place[];
  activeDay: Day | undefined;
  selectedPlaceId: string | null;
  onSelect: (id: string) => void;
  legs: Leg[];
  legsLoading: boolean;
  travelMode: TravelMode;
  editMode: boolean;
  tripSlug: string;
  onEditPlace: (p: Place) => void;
  onAddPlace: () => void;
  onChange: () => void;
}) {
  async function reorder(p: Place, direction: -1 | 1) {
    const sortedSameDay = places.filter((x) => x.dayId === p.dayId);
    const idx = sortedSameDay.findIndex((x) => x.id === p.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sortedSameDay.length) return;
    const other = sortedSameDay[swapIdx];
    await Promise.all([
      fetch(`/api/trips/${tripSlug}/places/${p.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderInDay: other.orderInDay }),
      }),
      fetch(`/api/trips/${tripSlug}/places/${other.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderInDay: p.orderInDay }),
      }),
    ]);
    onChange();
  }

  async function deletePlace(p: Place) {
    if (!confirm(`Supprimer « ${p.name} » ?`)) return;
    await fetch(`/api/trips/${tripSlug}/places/${p.id}`, { method: "DELETE" });
    onChange();
  }

  if (!activeDay || places.length === 0) {
    return (
      <div className="absolute left-1/2 -translate-x-1/2 bottom-5 panel-on-map rounded-2xl px-5 py-3 text-sm text-white/70 flex items-center gap-3">
        <span>
          {activeDay?.isOff
            ? "Jour OFF — repos & dernières gourmandises 🥐"
            : "Aucun lieu prévu ce jour"}
        </span>
        {editMode && (
          <button
            onClick={onAddPlace}
            className="rounded-full px-3 py-1.5 bg-white text-black text-xs font-medium inline-flex items-center gap-1.5 hover:bg-white/90"
          >
            <Plus className="h-3 w-3" /> Ajouter un lieu
          </button>
        )}
      </div>
    );
  }

  // Build a flat ordered list of items: place, leg, place, leg, place...
  // grouped by segment with a segment label inserted between groups.
  const segments = ["morning", "afternoon", "evening"] as const;
  const labels: Record<(typeof segments)[number], string> = {
    morning: "🌅 Matin",
    afternoon: "☀️ Après-midi",
    evening: "🌙 Soir",
  };

  // legs are indexed by ordered places (places[i] -> places[i+1])
  const legByPair = new Map<string, Leg>();
  legs.forEach((l) => legByPair.set(`${l.fromId}_${l.toId}`, l));

  const items: Array<
    | { kind: "label"; seg: (typeof segments)[number] }
    | { kind: "place"; place: Place; idx: number }
    | { kind: "leg"; leg: Leg }
  > = [];

  let lastSeg: string | null = null;
  places.forEach((p, idx) => {
    if (p.segment && p.segment !== lastSeg) {
      items.push({ kind: "label", seg: p.segment as (typeof segments)[number] });
      lastSeg = p.segment;
    }
    items.push({ kind: "place", place: p, idx });
    if (idx < places.length - 1) {
      const next = places[idx + 1];
      const leg = legByPair.get(`${p.id}_${next.id}`);
      if (leg) items.push({ kind: "leg", leg });
    }
  });

  return (
    <div className="absolute left-0 right-0 bottom-0 p-3 sm:p-4 pointer-events-none">
      <div className="panel-on-map-strong rounded-2xl pointer-events-auto overflow-x-auto">
        <div className="flex items-stretch gap-2 px-3 py-3 min-w-max">
          {items.map((item, i) => {
            if (item.kind === "label") {
              return (
                <div
                  key={`l-${i}`}
                  className="flex flex-col justify-center text-[10px] uppercase tracking-widest text-white/55 px-2"
                >
                  <span>{labels[item.seg]}</span>
                </div>
              );
            }
            if (item.kind === "leg") {
              const l = item.leg;
              return (
                <div
                  key={`leg-${i}`}
                  className="shrink-0 self-stretch flex flex-col items-center justify-center text-[10px] text-white/65 px-2 min-w-[80px]"
                >
                  <div className="flex items-center gap-1">
                    {travelMode === "walk" ? (
                      <Footprints className="h-3 w-3" />
                    ) : (
                      <Train className="h-3 w-3" />
                    )}
                    <span>{formatDuration(l.durationS)}</span>
                  </div>
                  <div className="mt-0.5 text-white/45">
                    {formatDistance(l.distanceM)}
                  </div>
                  {l.transit && (
                    <div className="mt-0.5 text-[9px] text-white/55 text-center leading-tight">
                      {l.transit.label} · {l.transit.priceHuf} Ft
                    </div>
                  )}
                </div>
              );
            }
            const p = item.place;
            const active = p.id === selectedPlaceId;
            return (
              <div
                key={p.id}
                className={`shrink-0 rounded-xl p-2.5 sm:p-3 w-36 sm:w-44 relative ${
                  active ? "place-cell-active" : "place-cell text-white"
                }`}
                style={{
                  borderLeft: active
                    ? `4px solid transparent`
                    : `4px solid ${activeDay.colorFrom}`,
                }}
              >
                <button
                  onClick={() => onSelect(p.id)}
                  className="text-left w-full"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.emoji}</span>
                    <span className="text-[10px] opacity-70 uppercase tracking-wider">
                      {p.suggestedStart && p.suggestedEnd
                        ? `${p.suggestedStart}–${p.suggestedEnd}`
                        : "souple"}
                    </span>
                  </div>
                  <div className="mt-1 font-medium text-sm leading-tight line-clamp-2">
                    {p.name}
                  </div>
                </button>
                {editMode && (
                  <div className="mt-2 flex items-center gap-1">
                    <button
                      onClick={() => reorder(p, -1)}
                      title="Avancer"
                      className="rounded p-1 bg-black/20 hover:bg-black/40"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => reorder(p, 1)}
                      title="Reculer"
                      className="rounded p-1 bg-black/20 hover:bg-black/40"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onEditPlace(p)}
                      title="Éditer"
                      className="rounded p-1 bg-black/20 hover:bg-black/40 ml-auto"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => deletePlace(p)}
                      title="Supprimer"
                      className="rounded p-1 bg-rose-500/30 hover:bg-rose-500/50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {editMode && (
            <button
              onClick={onAddPlace}
              className="shrink-0 rounded-xl border-2 border-dashed border-white/30 hover:border-white/60 hover:bg-white/5 transition text-white/80 hover:text-white p-2.5 sm:p-3 w-36 sm:w-44 flex flex-col items-center justify-center gap-1"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs font-medium">Ajouter un lieu</span>
            </button>
          )}
          {legsLoading && (
            <div className="shrink-0 self-center px-3 text-[10px] text-white/40">
              calcul des trajets…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
