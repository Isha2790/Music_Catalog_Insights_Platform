'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Lightbulb } from 'lucide-react';
import EqBars from './EqBars';

export default function InsightsPanel({ insight, loading }) {
  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2">
          <EqBars />
          <span className="text-sm text-ink-muted">Reading your library…</span>
        </div>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card relative overflow-hidden p-6"
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet/10 blur-3xl" />
      <div className="relative flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber" />
        <span className="label-eyebrow">AI insight engine</span>
      </div>
      <h2 className="relative mt-2 font-display text-xl font-semibold">{insight.headline}</h2>

      <div className="relative mt-5 grid gap-6 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
            <TrendingUp className="h-3.5 w-3.5" /> WHAT WE NOTICED
          </div>
          <ul className="mt-2.5 space-y-2">
            {insight.insights.map((line, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-soft" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
            <Lightbulb className="h-3.5 w-3.5" /> SUGGESTIONS
          </div>
          <ul className="mt-2.5 space-y-2">
            {insight.recommendations.map((line, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="relative mt-5 text-[11px] font-mono text-ink-faint">
        source: {insight.source === 'heuristic' ? 'rule-based insight engine' : insight.source}
      </p>
    </motion.div>
  );
}
