"use client";

import { motion } from "framer-motion";
import { CloudRain, X, MapPin } from "lucide-react";
import type { Place } from "./TripExperience";

export function RainyPanel({
  places,
  onSelect,
  onClose,
}: {
  places: Place[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-3 left-3 bottom-3 sm:top-4 sm:left-4 sm:bottom-4 w-[calc(100%-24px)] sm:w-[360px] z-20"
    >
      <div className="relative h-full panel-on-map-strong rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-sky-300" />
              <h3 className="text-base font-semibold">Si il pleut</h3>
            </div>
            <p className="text-xs text-sky-200/70 mt-1">
              Affichés en losanges 💧 sur la carte
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-white/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {places.length === 0 && (
            <p className="text-sm text-white/55 px-2 py-3">
              Aucune alternative pluie pour ce voyage.
            </p>
          )}
          {places.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="w-full text-left rounded-xl bg-white/5 hover:bg-white/10 transition p-3 flex gap-3"
            >
              <div className="text-2xl">{p.emoji}</div>
              <div className="min-w-0">
                <div className="font-medium text-sm">{p.name}</div>
                {p.address && (
                  <div className="text-xs text-white/55 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{p.address}</span>
                  </div>
                )}
                <div className="mt-1 text-xs text-white/65 line-clamp-2">
                  {p.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}
