'use client';

import { motion } from 'framer-motion';
import VinylRecord from './VinylRecord';

export default function EmptyState({ title, body, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line py-20 text-center"
    >
      <VinylRecord size={72} spinning={false} />
      <div>
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-muted">{body}</p>
      </div>
      {action}
    </motion.div>
  );
}
