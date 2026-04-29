"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, MapPin, CalendarDays } from "lucide-react";

type Props = {
  index: number;
  slug: string;
  name: string;
  city: string;
  country: string;
  emoji: string;
  accentFrom: string;
  accentTo: string;
  dateLabel: string;
  placesCount: number;
  daysCount: number;
};

export function TripCard({
  index,
  slug,
  name,
  city,
  country,
  emoji,
  accentFrom,
  accentTo,
  dateLabel,
  placesCount,
  daysCount,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: 0.15 + index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      <Link
        href={`/trips/${slug}`}
        className="relative block overflow-hidden rounded-3xl glass p-5 sm:p-6 h-full transition-all duration-300 hover:border-white/25"
      >
        {/* Gradient overlay glow */}
        <div
          className="pointer-events-none absolute -inset-x-12 -top-24 h-44 opacity-50 blur-3xl group-hover:opacity-80 transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
          }}
        />

        <div className="relative z-10 flex items-start justify-between">
          <div
            className="text-5xl sm:text-6xl drop-shadow-[0_8px_22px_rgba(0,0,0,0.45)] float-slow"
            aria-hidden
          >
            {emoji}
          </div>
          <div className="flex items-center gap-1.5 pill">
            <Lock className="h-3 w-3" />
            Privé
          </div>
        </div>

        <div className="relative z-10 mt-6">
          <h3 className="text-xl font-semibold tracking-tight">{name}</h3>
          <p className="text-sm text-[var(--muted)] mt-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {city}, {country}
          </p>
        </div>

        <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2">
          <span className="pill">
            <CalendarDays className="h-3 w-3" />
            {dateLabel}
          </span>
          <span className="pill">{daysCount} jours</span>
          <span className="pill">{placesCount} lieux</span>
        </div>

        <div className="relative z-10 mt-6 flex items-center text-sm font-medium text-white/80 group-hover:text-white transition-colors">
          Ouvrir le voyage
          <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
        </div>
      </Link>
    </motion.div>
  );
}
