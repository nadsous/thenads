"use client";

import type { Day } from "./TripExperience";
import { motion } from "framer-motion";
import { shortDateFr } from "@/lib/utils";
import { Plus, Pencil } from "lucide-react";

export function DayTimeline({
  days,
  activeDayIdx,
  onChange,
  editMode,
  onEditDay,
  onAddDay,
}: {
  days: Day[];
  activeDayIdx: number;
  onChange: (idx: number) => void;
  editMode?: boolean;
  onEditDay?: (d: Day) => void;
  onAddDay?: () => void;
}) {
  return (
    <div className="relative z-30 px-4 sm:px-6 mt-4 overflow-x-auto">
      <div className="flex gap-2.5 min-w-max">
        {days.map((d, i) => {
          const active = i === activeDayIdx;
          return (
            <div key={d.id} className="relative group">
              <motion.button
                type="button"
                layout
                whileHover={{ y: -2 }}
                onClick={() => onChange(i)}
                className={`relative rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 min-w-[150px] sm:min-w-[180px] text-left transition-all overflow-hidden block ${
                  active
                    ? "shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
                    : "glass hover:bg-white/10"
                } ${editMode ? "pr-8" : ""}`}
                style={
                  active
                    ? {
                        background: `linear-gradient(135deg, ${d.colorFrom}, ${d.colorTo})`,
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest opacity-80">
                  <span>Jour {d.index + 1}</span>
                  <span>{shortDateFr(d.date)}</span>
                </div>
                <div className="mt-1 text-xs sm:text-sm font-semibold truncate">
                  {d.label.split("—")[1]?.trim() || d.label}
                </div>
                {!active && (
                  <div
                    className="absolute left-0 top-0 h-full w-1"
                    style={{
                      background: `linear-gradient(180deg, ${d.colorFrom}, ${d.colorTo})`,
                    }}
                  />
                )}
              </motion.button>
              {editMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditDay?.(d);
                  }}
                  className="absolute top-1.5 right-1.5 rounded-full p-1 bg-black/30 hover:bg-black/50 z-10"
                  title="Éditer ce jour"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
        {editMode && (
          <button
            onClick={onAddDay}
            className="rounded-2xl border-2 border-dashed border-white/30 hover:border-white/60 hover:bg-white/5 transition flex flex-col items-center justify-center gap-1 px-4 py-2.5 sm:py-3 min-w-[110px]"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs font-medium">Ajouter</span>
          </button>
        )}
      </div>
    </div>
  );
}
