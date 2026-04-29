"use client";

import { motion } from "framer-motion";
import { Plane, Sparkles } from "lucide-react";

export function HeroAnimated() {
  return (
    <header className="relative pt-12 sm:pt-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--muted)]"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Carnet de voyages — by Nads</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]"
      >
        Tes voyages,{" "}
        <span className="shimmer-text">épinglés</span>
        <br />
        sur la carte.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 max-w-2xl text-base sm:text-lg text-[var(--muted)] leading-relaxed"
      >
        Chaque voyage est protégé par un mot de passe. Choisis ton voyage,
        ouvre la carte, et déroule la journée — à pied ou en transport.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.2, delay: 0.4, type: "spring", bounce: 0.4 }}
        className="absolute right-0 top-10 sm:top-16 hidden md:block"
      >
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-pink-500/30 rounded-full" />
          <Plane className="relative h-20 w-20 text-pink-300 float-slow rotate-12" />
        </div>
      </motion.div>
    </header>
  );
}
