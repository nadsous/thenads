"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Search, Loader2, Save } from "lucide-react";
import type { Day, Place } from "./TripExperience";

type Initial = Partial<Place> & { lat?: number; lng?: number; dayId?: string | null };

export function PlaceEditor({
  tripSlug,
  days,
  place,
  initial,
  onClose,
  onSaved,
}: {
  tripSlug: string;
  days: Day[];
  place?: Place;
  initial?: Initial;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!place;
  const seed: Initial = place ?? initial ?? {};

  const [form, setForm] = useState({
    name: seed.name ?? "",
    emoji: seed.emoji ?? "📍",
    category: seed.category ?? "monument",
    lat: seed.lat ?? 47.4979,
    lng: seed.lng ?? 19.0537,
    address: seed.address ?? "",
    dayId: seed.dayId ?? null,
    segment: seed.segment ?? "morning",
    suggestedStart: seed.suggestedStart ?? "",
    suggestedEnd: seed.suggestedEnd ?? "",
    durationMinutes: seed.durationMinutes ?? 60,
    description: seed.description ?? "",
    humorComment: seed.humorComment ?? "",
    funFact: seed.funFact ?? "",
    tip: seed.tip ?? "",
    openingHours: seed.openingHours ?? "",
    priceInfo: seed.priceInfo ?? "",
    crowdLevel: seed.crowdLevel ?? "",
    crowdNote: seed.crowdNote ?? "",
    bookingUrl: seed.bookingUrl ?? "",
    mustReserve: seed.mustReserve ?? false,
    isRainyAlt: seed.isRainyAlt ?? false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Geocode panel
  const [geoQuery, setGeoQuery] = useState(seed.address ?? "");
  const [geoResults, setGeoResults] = useState<
    Array<{ lat: number; lng: number; displayName: string }>
  >([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const geoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!geoQuery || geoQuery.length < 4) {
      setGeoResults([]);
      return;
    }
    if (geoTimer.current) clearTimeout(geoTimer.current);
    geoTimer.current = setTimeout(async () => {
      setGeoLoading(true);
      try {
        const r = await fetch(`/api/geocode?q=${encodeURIComponent(geoQuery)}`);
        const data = await r.json();
        setGeoResults(data.results ?? []);
      } finally {
        setGeoLoading(false);
      }
    }, 400);
  }, [geoQuery]);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const url = isEdit
        ? `/api/trips/${tripSlug}/places/${place!.id}`
        : `/api/trips/${tripSlug}/places`;
      const method = isEdit ? "PATCH" : "POST";
      const payload = {
        ...form,
        durationMinutes: Number(form.durationMinutes) || null,
        crowdLevel: form.crowdLevel || null,
        bookingUrl: form.bookingUrl || null,
        suggestedStart: form.suggestedStart || null,
        suggestedEnd: form.suggestedEnd || null,
        address: form.address || null,
        tip: form.tip || null,
        openingHours: form.openingHours || null,
        priceInfo: form.priceInfo || null,
        crowdNote: form.crowdNote || null,
        funFact: form.funFact || null,
      };
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur sauvegarde");
      }
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold">
            {isEdit ? "Modifier le lieu" : "Nouveau lieu"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Name + emoji */}
          <div className="flex gap-2">
            <input
              value={form.emoji}
              onChange={(e) => update("emoji", e.target.value)}
              className="w-14 text-center text-xl rounded-lg bg-white/5 border border-white/10 px-2 py-2 outline-none focus:border-white/30"
              maxLength={4}
            />
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Nom du lieu"
              className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
            />
          </div>

          {/* Geocode search */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <label className="text-[10px] uppercase tracking-widest text-white/55 flex items-center gap-1.5">
              <Search className="h-3 w-3" /> Adresse / Recherche
            </label>
            <div className="mt-1 flex gap-2">
              <input
                value={geoQuery}
                onChange={(e) => setGeoQuery(e.target.value)}
                placeholder="Ex : Bastion des Pêcheurs Budapest"
                className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
              />
              {geoLoading && <Loader2 className="h-4 w-4 animate-spin self-center" />}
            </div>
            {geoResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-lg bg-black/30 divide-y divide-white/5">
                {geoResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      update("lat", r.lat);
                      update("lng", r.lng);
                      update("address", r.displayName);
                      setGeoQuery(r.displayName);
                      setGeoResults([]);
                    }}
                    className="w-full text-left text-xs p-2 hover:bg-white/5"
                  >
                    {r.displayName}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <input
                type="number"
                step="0.0001"
                value={form.lat}
                onChange={(e) => update("lat", parseFloat(e.target.value) || 0)}
                className="rounded-lg bg-black/30 border border-white/10 px-2 py-1.5 outline-none"
                placeholder="Lat"
              />
              <input
                type="number"
                step="0.0001"
                value={form.lng}
                onChange={(e) => update("lng", parseFloat(e.target.value) || 0)}
                className="rounded-lg bg-black/30 border border-white/10 px-2 py-1.5 outline-none"
                placeholder="Lng"
              />
            </div>
          </div>

          {/* Day + segment */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.dayId ?? ""}
              onChange={(e) => update("dayId", e.target.value || null)}
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none text-sm"
            >
              <option value="">Aucun jour (alt. pluie)</option>
              {days.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            <select
              value={form.segment ?? ""}
              onChange={(e) => update("segment", e.target.value)}
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none text-sm"
            >
              <option value="">Sans créneau</option>
              <option value="morning">🌅 Matin</option>
              <option value="afternoon">☀️ Après-midi</option>
              <option value="evening">🌙 Soir</option>
            </select>
          </div>

          {/* Time + duration */}
          <div className="grid grid-cols-3 gap-2">
            <input
              value={form.suggestedStart}
              onChange={(e) => update("suggestedStart", e.target.value)}
              placeholder="9h00"
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
            />
            <input
              value={form.suggestedEnd}
              onChange={(e) => update("suggestedEnd", e.target.value)}
              placeholder="10h30"
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
            />
            <input
              type="number"
              value={form.durationMinutes}
              onChange={(e) => update("durationMinutes", parseInt(e.target.value) || 0)}
              placeholder="durée min"
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
            />
          </div>

          {/* Texts */}
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
          />
          <textarea
            value={form.humorComment}
            onChange={(e) => update("humorComment", e.target.value)}
            placeholder="Vibe humour ✨"
            rows={2}
            className="w-full rounded-lg bg-pink-400/5 border border-pink-400/20 px-3 py-2 text-sm outline-none"
          />
          <textarea
            value={form.funFact}
            onChange={(e) => update("funFact", e.target.value)}
            placeholder="Tu le savais ? 🧠"
            rows={2}
            className="w-full rounded-lg bg-violet-400/5 border border-violet-400/20 px-3 py-2 text-sm outline-none"
          />
          <textarea
            value={form.tip}
            onChange={(e) => update("tip", e.target.value)}
            placeholder="Astuce 💡"
            rows={2}
            className="w-full rounded-lg bg-emerald-400/5 border border-emerald-400/20 px-3 py-2 text-sm outline-none"
          />

          <input
            value={form.openingHours}
            onChange={(e) => update("openingHours", e.target.value)}
            placeholder="Horaires d'ouverture"
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.priceInfo}
              onChange={(e) => update("priceInfo", e.target.value)}
              placeholder="Prix"
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
            />
            <select
              value={form.crowdLevel}
              onChange={(e) => update("crowdLevel", e.target.value)}
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
            >
              <option value="">Affluence ?</option>
              <option value="calm">Tranquille</option>
              <option value="medium">Modéré</option>
              <option value="busy">Animé</option>
              <option value="very_busy">Très bondé</option>
            </select>
          </div>
          <input
            value={form.crowdNote}
            onChange={(e) => update("crowdNote", e.target.value)}
            placeholder="Quand y aller / éviter ?"
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
          />
          <input
            value={form.bookingUrl}
            onChange={(e) => update("bookingUrl", e.target.value)}
            placeholder="Lien de réservation (optionnel)"
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
          />

          <div className="flex flex-wrap gap-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.mustReserve}
                onChange={(e) => update("mustReserve", e.target.checked)}
              />
              À réserver
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isRainyAlt}
                onChange={(e) => update("isRainyAlt", e.target.checked)}
              />
              Alternative pluie
            </label>
          </div>

          {error && <p className="text-rose-300 text-sm">{error}</p>}
        </div>

        <div className="border-t border-white/10 p-4 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm hover:bg-white/10"
          >
            Annuler
          </button>
          <button
            onClick={save}
            disabled={saving || !form.name || !form.lat || !form.lng}
            className="rounded-lg px-4 py-2 text-sm bg-white text-black font-medium hover:bg-white/90 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
