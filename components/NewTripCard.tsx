"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export function NewTripCard({ index }: { index: number }) {
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
    >
      <Link
        href="/trips/new"
        className="group relative flex flex-col items-center justify-center text-center min-h-[260px] rounded-3xl border-2 border-dashed border-white/15 hover:border-white/40 hover:bg-white/[0.04] transition-all p-6"
      >
        <div className="rounded-full bg-white/5 group-hover:bg-white/10 transition p-4">
          <Plus className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-semibold tracking-tight">Nouveau voyage</h3>
        <p className="mt-1 text-sm text-[var(--muted)] max-w-[18ch]">
          Crée un voyage avec ton mot de passe et ses dates.
        </p>
      </Link>
    </motion.div>
  );
}
