'use client';

import { motion } from 'framer-motion';

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-16 sm:py-24 lg:py-32" id="hero-banner">
      <div className="mx-auto max-w-4xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-4xl font-black italic leading-tight tracking-tight sm:text-5xl lg:text-7xl"
          style={{ fontStyle: 'italic' }}
        >
          EL DISEÑO QUE MÁS TE GUSTE
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
        >
          Somos una marca de estampados, sublimación y algo más. Camisas personalizadas a tu gusto, hechas para durar.
        </motion.p>
      </div>

      {/* Subtle gradient orbs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
    </section>
  );
}
