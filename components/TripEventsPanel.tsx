"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, X, ExternalLink, Ticket } from "lucide-react";

export type ManualEvent = {
  id: string;
  name: string;
  date: string;
  time: string | null;
  venue: string | null;
  url: string | null;
  imageUrl: string | null;
  category: string | null;
};

export function TripEventsPanel({
  slug,
  accentFrom,
  accentTo,
}: {
  slug: string;
  accentFrom: string;
  accentTo: string;
}) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<ManualEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/trips/${slug}/events`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
        else setEvents([]);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [open, slug]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Événements du voyage"
        className="glass rounded-full p-2 hover:bg-white/10 transition"
        style={
          open
            ? {
                background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
                borderColor: "transparent",
              }
            : undefined
        }
      >
        <Ticket className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-3 left-3 bottom-3 sm:top-4 sm:left-4 sm:bottom-4 w-[calc(100%-24px)] sm:w-[360px] z-20"
          >
            <div className="relative h-full glass-strong rounded-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" style={{ color: accentFrom }} />
                  <h3 className="text-base font-semibold">Événements</h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1.5 hover:bg-white/10 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loading && (
                  <p className="text-sm text-white/55 px-2 py-3">Chargement…</p>
                )}

                {!loading && events.length === 0 && (
                  <p className="text-sm text-white/55 px-2 py-3">
                    Aucun événement ajouté pour ce voyage.
                  </p>
                )}

                {events.map((ev) => {
                  const d = new Date(ev.date);
                  const dateStr = d.toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  });
                  const Wrapper = ev.url ? "a" : "div";
                  const wrapperProps = ev.url
                    ? {
                        href: ev.url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                      }
                    : {};

                  return (
                    <Wrapper
                      key={ev.id}
                      {...(wrapperProps as any)}
                      className={`w-full text-left rounded-xl bg-white/5 hover:bg-white/10 transition p-3 flex gap-3 ${
                        ev.url ? "cursor-pointer" : ""
                      }`}
                    >
                      {ev.imageUrl ? (
                        <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-white/5">
                          <img
                            src={ev.imageUrl}
                            alt={ev.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="shrink-0 w-14 h-14 rounded-lg bg-white/5 grid place-items-center text-xl">
                          🎫
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm">{ev.name}</div>
                        <div className="text-xs text-white/55 mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {dateStr}
                          {ev.time && ` · ${ev.time}`}
                        </div>
                        {ev.venue && (
                          <div className="text-xs text-white/55 mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{ev.venue}</span>
                          </div>
                        )}
                        {ev.category && (
                          <div className="mt-1.5">
                            <span className="pill text-[9px]">{ev.category}</span>
                          </div>
                        )}
                      </div>
                      {ev.url && (
                        <ExternalLink className="shrink-0 h-3 w-3 text-white/20 self-center" />
                      )}
                    </Wrapper>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
