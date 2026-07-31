'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import VinylRecord from './VinylRecord';
import EqBars from './EqBars';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void px-6">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="card relative z-10 w-full max-w-md p-8"
      >
        <div className="flex flex-col items-center text-center">
          <VinylRecord size={56} />
          <Link href="/" className="mt-4 flex items-center gap-2 font-display text-lg font-semibold">
            Vinylite <EqBars />
          </Link>
          <h1 className="mt-6 font-display text-2xl font-semibold">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>
        </div>

        <div className="mt-8">{children}</div>

        {footer && <div className="mt-6 text-center text-sm text-ink-muted">{footer}</div>}
      </motion.div>
    </main>
  );
}
