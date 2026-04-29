"use client";

import type { TripData } from "./TripExperience";
import { motion } from "framer-motion";

export function TripHeader({ trip }: { trip: TripData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="hidden sm:flex items-center gap-2.5 glass rounded-full px-4 py-1.5"
    >
      <span className="text-lg leading-none">{trip.coverEmoji}</span>
      <span className="text-sm font-medium">{trip.name}</span>
    </motion.div>
  );
}
