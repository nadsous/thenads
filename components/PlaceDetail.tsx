"use client";

import { motion } from "framer-motion";
import {
  X,
  Clock,
  MapPin,
  Smile,
  Lightbulb,
  Calendar,
  Navigation,
  Footprints,
  ExternalLink,
  Banknote,
  Users,
  Ticket,
  Brain,
} from "lucide-react";
import type { Place, TravelMode } from "./TripExperience";

function CrowdBadge({ level }: { level: string }) {
  const map: Record<string, { label: string; color: string; dots: number }> = {
    calm: { label: "Tranquille", color: "#10b981", dots: 1 },
    medium: { label: "Modéré", color: "#facc15", dots: 2 },
    busy: { label: "Animé", color: "#fb923c", dots: 3 },
    very_busy: { label: "Très bondé", color: "#f87171", dots: 4 },
  };
  const v = map[level] ?? { label: level, color: "#94a3b8", dots: 2 };
  return (
    <div className="inline-flex items-center gap-1.5 text-sm" style={{ color: v.color }}>
      <span className="flex gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="block h-1.5 w-1.5 rounded-full"
            style={{ background: i <= v.dots ? v.color : "rgba(255,255,255,0.18)" }}
          />
        ))}
      </span>
      <span className="font-medium">{v.label}</span>
    </div>
  );
}

export function PlaceDetail({
  place,
  travelMode,
  accentFrom,
  accentTo,
  onClose,
}: {
  place: Place;
  travelMode: TravelMode;
  accentFrom: string;
  accentTo: string;
  onClose: () => void;
}) {
  const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&travelmode=${
    travelMode === "walk" ? "walking" : "transit"
  }`;
  const apple = `http://maps.apple.com/?daddr=${place.lat},${place.lng}&dirflg=${
    travelMode === "walk" ? "w" : "r"
  }`;
  const search = encodeURIComponent(`${place.name} ${place.address ?? "Budapest"}`);
  const gmapsSearch = `https://www.google.com/maps/search/?api=1&query=${search}`;

  return (
    <motion.aside
      initial={{
        opacity: 0,
        y: typeof window !== "undefined" && window.innerWidth < 640 ? 80 : 0,
        x: typeof window !== "undefined" && window.innerWidth < 640 ? 0 : 60,
      }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, y: 80 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="absolute z-20
        left-2 right-2 bottom-2 max-h-[78%]
        sm:left-auto sm:top-4 sm:right-4 sm:bottom-4 sm:max-h-none sm:w-[400px]"
    >
      <div className="relative h-full max-h-[78vh] sm:max-h-none panel-on-map-strong rounded-2xl overflow-hidden flex flex-col">
        <div
          className="h-32 relative"
          style={{
            background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full bg-black/40 hover:bg-black/60 p-1.5 transition"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          <div className="absolute bottom-3 left-4 flex items-center gap-3">
            <span className="text-5xl drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)]">
              {place.emoji}
            </span>
            <div>
              <h3 className="text-white text-lg font-semibold leading-tight drop-shadow">
                {place.name}
              </h3>
              {place.address && (
                <p className="text-white/85 text-xs flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {place.address}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {place.mustReserve && (
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-amber-200 text-xs flex items-center gap-2">
              <Calendar className="h-4 w-4" /> À réserver à l'avance
              {place.bookingUrl && (
                <a
                  href={place.bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1 text-amber-100 underline-offset-2 hover:underline"
                >
                  <Ticket className="h-3.5 w-3.5" />
                  Réserver
                </a>
              )}
            </div>
          )}

          {(place.priceInfo || place.crowdLevel) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {place.priceInfo && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/50">
                    <Banknote className="h-3 w-3" /> Prix
                  </div>
                  <p className="text-sm mt-1">{place.priceInfo}</p>
                </div>
              )}
              {place.crowdLevel && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/50">
                    <Users className="h-3 w-3" /> Affluence
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <CrowdBadge level={place.crowdLevel} />
                  </div>
                  {place.crowdNote && (
                    <p className="text-xs text-white/65 mt-2">{place.crowdNote}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {(place.suggestedStart || place.openingHours) && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              {place.suggestedStart && place.suggestedEnd && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-white/70" />
                  <span className="font-medium">
                    Plage suggérée : {place.suggestedStart} – {place.suggestedEnd}
                  </span>
                </div>
              )}
              {place.openingHours && (
                <p className="text-xs text-white/65 mt-2">
                  <span className="opacity-60">Horaires : </span>
                  {place.openingHours}
                </p>
              )}
              {place.durationMinutes && (
                <p className="text-xs text-white/65 mt-1">
                  <span className="opacity-60">Durée moyenne : </span>
                  {place.durationMinutes} min
                </p>
              )}
            </div>
          )}

          <div>
            <p className="text-sm leading-relaxed text-white/90">
              {place.description}
            </p>
          </div>

          <div className="rounded-xl border border-pink-400/20 bg-pink-400/10 p-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-pink-200">
              <Smile className="h-3 w-3" /> Vibe humour
            </div>
            <p className="text-sm italic text-pink-50 mt-1">
              « {place.humorComment} »
            </p>
          </div>

          {place.funFact && (
            <div className="rounded-xl border border-violet-400/20 bg-violet-400/10 p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-violet-200">
                <Brain className="h-3 w-3" /> Tu le savais ?
              </div>
              <p className="text-sm text-violet-50 mt-1 leading-relaxed">
                {place.funFact}
              </p>
            </div>
          )}

          {place.tip && (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-200">
                <Lightbulb className="h-3 w-3" /> Astuce
              </div>
              <p className="text-sm text-emerald-50 mt-1">{place.tip}</p>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-white/10 grid grid-cols-2 gap-2">
          <a
            href={gmaps}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white text-black text-sm font-medium py-2.5 hover:bg-white/90 transition"
          >
            {travelMode === "walk" ? (
              <Footprints className="h-4 w-4" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Google Maps
          </a>
          <a
            href={apple}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium py-2.5 transition"
          >
            <ExternalLink className="h-4 w-4" />
            Apple Plans
          </a>
          <a
            href={gmapsSearch}
            target="_blank"
            rel="noreferrer"
            className="col-span-2 text-center text-xs text-white/55 hover:text-white/80 transition"
          >
            Voir l'endroit dans Google Maps →
          </a>
        </div>
      </div>
    </motion.aside>
  );
}
