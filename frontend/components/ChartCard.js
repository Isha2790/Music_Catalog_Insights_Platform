'use client';

import { motion } from 'framer-motion';

export default function ChartCard({ title, subtitle, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay }}
      className="card p-5"
    >
      <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </motion.div>
  );
}
