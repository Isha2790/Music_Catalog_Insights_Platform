'use client';

import { motion } from 'framer-motion';
import { Plus, Check, Disc3 } from 'lucide-react';

export default function AlbumCard({ album, index = 0, saved = false, onSave, saving = false }) {
  const year = album.releaseDate ? album.releaseDate.substring(0, 4) : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -4 }}
      className="card group relative flex flex-col overflow-hidden p-4"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface">
        {album.artworkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={album.artworkUrl}
            alt={`${album.title} artwork`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint">
            <Disc3 className="h-10 w-10" strokeWidth={1} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="mt-3 flex-1">
        <h3 className="line-clamp-1 font-display text-sm font-semibold text-ink" title={album.title}>
          {album.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted" title={album.artistName}>
          {album.artistName}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-faint font-mono">
          {album.genre && <span className="rounded-full border border-line px-2 py-0.5">{album.genre}</span>}
          <span className="rounded-full border border-line px-2 py-0.5">{year}</span>
          {album.trackCount && <span className="rounded-full border border-line px-2 py-0.5">{album.trackCount} tracks</span>}
        </div>
      </div>

      <button
        onClick={() => onSave?.(album)}
        disabled={saved || saving}
        className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all ${
          saved
            ? 'bg-emerald-500/15 text-emerald-300 cursor-default'
            : 'bg-violet/15 text-violet-soft hover:bg-violet hover:text-white'
        }`}
      >
        {saved ? (<><Check className="h-3.5 w-3.5" /> In your library</>) : (<><Plus className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save to library'}</>)}
      </button>
    </motion.div>
  );
}
