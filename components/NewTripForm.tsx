"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plane, Sparkles } from "lucide-react";
import Link from "next/link";

const PALETTES: Array<[string, string, string, string]> = [
  ["#fb923c", "#f43f5e", "Coucher", "🌅"],
  ["#6366f1", "#22d3ee", "Océan", "🌊"],
  ["#10b981", "#a3e635", "Forêt", "🌿"],
  ["#f472b6", "#a78bfa", "Pétale", "🌸"],
  ["#facc15", "#f97316", "Soleil", "☀️"],
  ["#06b6d4", "#3b82f6", "Ciel", "✈️"],
  ["#a855f7", "#ec4899", "Néon", "🌃"],
];

const EMOJIS = ["✈️", "🛁", "🗺️", "🏖️", "⛰️", "🏛️", "🍝", "🍣", "🌊", "🌃", "🍷", "🛤️", "🎡", "🌄"];

export function NewTripForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [password, setPassword] = useState("");
  const [coverEmoji, setCoverEmoji] = useState("✈️");
  const [palette, setPalette] = useState<[string, string]>([
    PALETTES[0][0],
    PALETTES[0][1],
  ]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/create`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          country,
          startDate,
          endDate,
          password,
          coverEmoji,
          accentFrom: palette[0],
          accentTo: palette[1],
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      router.push(`/trips/${data.slug}`);
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-5 sm:px-8 pt-10 pb-24">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition mb-6 self-start glass rounded-full px-3 py-1.5"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Retour
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--muted)]"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Nouveau voyage</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-3 text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05]"
      >
        Où part-on cette fois ?
      </motion.h1>

      <form onSubmit={submit} className="mt-10 space-y-5">
        {/* Cover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl glass-strong p-5 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${palette[0]}25, ${palette[1]}25), rgba(255,255,255,0.04)`,
          }}
        >
          <div
            className="absolute -inset-x-6 -top-12 h-32 blur-3xl opacity-60 pointer-events-none"
            style={{ background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})` }}
          />
          <div className="relative flex items-start gap-4">
            <div className="text-6xl float-slow">{coverEmoji}</div>
            <div className="flex-1">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom du voyage (ex : Lisbonne, Mai 2025)"
                className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-white/35"
                required
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ville"
                  className="rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm outline-none"
                  required
                />
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Pays"
                  className="rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
          </div>
          <div className="relative mt-4">
            <p className="text-[10px] uppercase tracking-widest text-white/55 mb-2">
              Emoji de couverture
            </p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setCoverEmoji(e)}
                  className={`h-9 w-9 rounded-lg text-xl transition ${
                    coverEmoji === e
                      ? "bg-white/20 ring-1 ring-white"
                      : "hover:bg-white/10"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="relative mt-4">
            <p className="text-[10px] uppercase tracking-widest text-white/55 mb-2">
              Palette
            </p>
            <div className="flex flex-wrap gap-2">
              {PALETTES.map(([f, t, name]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setPalette([f, t])}
                  className={`h-10 w-16 rounded-lg ${
                    palette[0] === f && palette[1] === t ? "ring-2 ring-white" : ""
                  }`}
                  style={{ background: `linear-gradient(135deg, ${f}, ${t})` }}
                  title={name}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/55">
              Date de début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
              required
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/55">
              Date de fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/55">
            Mot de passe d'accès
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Court et facile (ex: lisbonne25)"
            className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
            required
            minLength={4}
          />
          <p className="mt-1 text-xs text-white/45">
            Tu devras le partager pour donner accès au voyage. Tu pourras tout éditer en étant connecté.
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/55">
            Notes (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Vol, hôtel, bonnes intentions..."
            rows={2}
            className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
          />
        </div>

        {error && <p className="text-rose-300 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-medium text-white disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
          }}
        >
          {submitting ? "Création..." : "Créer le voyage"}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </main>
  );
}
