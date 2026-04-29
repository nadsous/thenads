"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Trash2 } from "lucide-react";
import type { Day } from "./TripExperience";

const PALETTES: Array<[string, string, string]> = [
  ["#fb923c", "#f43f5e", "Coucher"],
  ["#6366f1", "#22d3ee", "Océan"],
  ["#10b981", "#a3e635", "Forêt"],
  ["#f472b6", "#a78bfa", "Pétale"],
  ["#facc15", "#f97316", "Soleil"],
  ["#06b6d4", "#3b82f6", "Ciel"],
  ["#a855f7", "#ec4899", "Néon"],
];

export function DayEditor({
  tripSlug,
  day,
  onClose,
  onSaved,
}: {
  tripSlug: string;
  day: Day;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [label, setLabel] = useState(day.label);
  const [subtitle, setSubtitle] = useState(day.subtitle ?? "");
  const [date, setDate] = useState(day.date.slice(0, 10));
  const [colorFrom, setColorFrom] = useState(day.colorFrom);
  const [colorTo, setColorTo] = useState(day.colorTo);
  const [isOff, setIsOff] = useState(day.isOff);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/trips/${tripSlug}/days/${day.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label, subtitle, date, colorFrom, colorTo, isOff }),
    });
    setSaving(false);
    onSaved();
  }

  async function remove() {
    if (!confirm(`Supprimer ce jour ? Les lieux y attachés deviendront « non assignés ».`))
      return;
    setDeleting(true);
    await fetch(`/api/trips/${tripSlug}/days/${day.id}`, { method: "DELETE" });
    setDeleting(false);
    onSaved();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-2xl w-full max-w-md overflow-hidden"
      >
        <div
          className="h-20 relative"
          style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}
        >
          <button onClick={onClose} className="absolute top-2 right-2 p-1.5 bg-black/30 rounded-full">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/55">Titre</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/55">Sous-titre</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/55">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/55">Palette</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PALETTES.map(([f, t, name]) => (
                <button
                  key={name}
                  onClick={() => {
                    setColorFrom(f);
                    setColorTo(t);
                  }}
                  className={`h-9 w-14 rounded-lg ${
                    colorFrom === f && colorTo === t
                      ? "ring-2 ring-white"
                      : ""
                  }`}
                  style={{ background: `linear-gradient(135deg, ${f}, ${t})` }}
                  title={name}
                />
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isOff} onChange={(e) => setIsOff(e.target.checked)} />
            Jour OFF (départ / arrivée / repos)
          </label>
        </div>
        <div className="border-t border-white/10 p-4 flex justify-between items-center">
          <button
            onClick={remove}
            disabled={deleting}
            className="text-rose-300 hover:text-rose-200 text-sm inline-flex items-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "..." : "Supprimer"}
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm hover:bg-white/10">
              Annuler
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm bg-white text-black font-medium hover:bg-white/90 inline-flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              {saving ? "..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
