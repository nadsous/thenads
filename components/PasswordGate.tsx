"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  slug: string;
  tripName: string;
  city: string;
  emoji: string;
  accentFrom: string;
  accentTo: string;
};

export function PasswordGate({
  slug,
  tripName,
  city,
  emoji,
  accentFrom,
  accentTo,
}: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${slug}/auth`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Mot de passe incorrect");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Erreur réseau");
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div
          className="pointer-events-none absolute -inset-x-10 -top-20 h-48 opacity-60 blur-3xl"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        />
        <div className="relative glass-strong rounded-3xl p-7 sm:p-9">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-white transition mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Retour aux voyages
          </Link>

          <div className="text-6xl float-slow drop-shadow-[0_8px_22px_rgba(0,0,0,0.45)]">
            {emoji}
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">{tripName}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{city}</p>

          <div className="mt-7 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            <Lock className="h-3.5 w-3.5" /> Voyage privé
          </div>

          <form onSubmit={submit} className="mt-3">
            <div className="relative">
              <input
                autoFocus
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-base outline-none focus:border-white/30 focus:bg-white/10 transition placeholder:text-white/35"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: [0, -6, 6, -3, 3, 0] }}
                transition={{ duration: 0.4 }}
                className="mt-3 text-sm text-rose-300"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
              }}
            >
              {loading ? "Vérification..." : "Ouvrir la carte"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-5 text-xs text-[var(--muted-2)]">
            Indice : c'est un mot court et facile à retenir.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
