"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, X, ExternalLink, Ticket, Music } from "lucide-react";
import {
  TicketmasterEvent,
  TicketmasterResponse,
  getBestImage,
  formatEventDate,
  formatEventTime,
} from "@/lib/ticketmaster";

export function EventsPanel({
  city,
  country,
  startDate,
  endDate,
  accentFrom,
  accentTo,
}: {
  city: string;
  country: string;
  startDate?: string;
  endDate?: string;
  accentFrom: string;
  accentTo: string;
}) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<TicketmasterEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);

    const url = new URL("/api/events", window.location.origin);
    url.searchParams.set("city", city);
    if (country) url.searchParams.set("country", country);
    if (startDate) url.searchParams.set("startDate", startDate.slice(0, 10));
    if (endDate) url.searchParams.set("endDate", endDate.slice(0, 10));
    url.searchParams.set("size", "12");

    fetch(url.toString())
      .then((r) => r.json())
      .then((data: TicketmasterResponse) => {
        setEvents(data._embedded?.events ?? []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [open, city, country, startDate, endDate]);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Événements à proximité"
        className="glass rounded-full p-2 hover:bg-white/10 transition"
        style={{
          background: open
            ? `linear-gradient(135deg, ${accentFrom}, ${accentTo})`
            : undefined,
          borderColor: open ? "transparent" : undefined,
        }}
      >
        <Ticket className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="absolute right-0 top-14 z-40 w-[340px] max-w-[calc(100vw-2rem)]"
          >
            <div className="glass-strong rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-white/70" />
                  <span className="text-sm font-medium">Événements</span>
                  <span className="text-[10px] text-white/40">· {city}</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 transition"
                >
                  <X className="h-3.5 w-3.5 text-white/60" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2.5">
                {loading && (
                  <div className="text-center py-6 text-sm text-white/50">
                    Chargement…
                  </div>
                )}

                {error && (
                  <div className="text-center py-6 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {!loading && !error && events.length === 0 && (
                  <div className="text-center py-6 text-sm text-white/50">
                    Aucun événement trouvé pour cette période.
                  </div>
                )}

                {events.map((ev) => {
                  const img = getBestImage(ev.images, 300);
                  const venue = ev._embedded?.venues?.[0];
                  const dateStr = formatEventDate(
                    ev.dates.start.localDate,
                    ev.dates.start.localTime
                  );
                  const timeStr = formatEventTime(ev.dates.start.localTime);
                  const genre = ev.classifications?.[0]?.genre?.name;

                  return (
                    <a
                      key={ev.id}
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-3 rounded-xl p-2.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/10 transition"
                    >
                      {img && (
                        <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                          <img
                            src={img.url}
                            alt={ev.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium leading-tight line-clamp-2 group-hover:text-white/90 transition">
                          {ev.name}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-white/50">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {dateStr}
                            {timeStr && ` · ${timeStr}`}
                          </span>
                          {venue?.name && (
                            <span className="inline-flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3" />
                              {venue.name}
                            </span>
                          )}
                        </div>
                        {genre && (
                          <div className="mt-1.5">
                            <span className="pill text-[9px]">{genre}</span>
                          </div>
                        )}
                      </div>
                      <ExternalLink className="shrink-0 h-3 w-3 text-white/20 group-hover:text-white/50 self-center transition" />
                    </a>
                  );
                })}
              </div>

              {/* Footer */}
              {events.length > 0 && (
                <div className="px-4 py-2.5 border-t border-white/10 text-[10px] text-white/30 text-center">
                  via Ticketmaster
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
