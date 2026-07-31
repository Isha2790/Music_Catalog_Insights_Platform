'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Disc3, NotebookPen } from 'lucide-react';
import StarRating from './StarRating';

export default function LibraryCard({ item, index = 0, onUpdate, onDelete }) {
  const [notes, setNotes] = useState(item.userNotes || '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const year = item.releaseDate ? String(item.releaseDate).substring(0, 4) : '—';

  async function handleRatingChange(rating) {
    onUpdate(item.id, { userRating: rating, userNotes: item.userNotes });
  }

  async function handleNotesSave() {
    setEditingNotes(false);
    onUpdate(item.id, { userRating: item.userRating, userNotes: notes });
  }

  async function handleDelete() {
    setDeleting(true);
    await onDelete(item.id);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: deleting ? 0 : 1, y: 0, scale: deleting ? 0.9 : 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      className="card flex gap-4 p-4"
    >
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface">
        {item.artworkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.artworkUrl} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint">
            <Disc3 className="h-8 w-8" strokeWidth={1} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-sm font-semibold">{item.title}</h3>
            <p className="truncate text-xs text-ink-muted">{item.artistName}</p>
          </div>
          <button
            onClick={handleDelete}
            className="shrink-0 rounded-full p-1.5 text-ink-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
            aria-label="Remove from library"
            title="Remove from library"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-faint font-mono">
          {item.genre && <span className="rounded-full border border-line px-2 py-0.5">{item.genre}</span>}
          <span className="rounded-full border border-line px-2 py-0.5">{year}</span>
          {item.trackCount && <span className="rounded-full border border-line px-2 py-0.5">{item.trackCount} tracks</span>}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <StarRating value={item.userRating || 0} onChange={handleRatingChange} size={15} />
          <button
            onClick={() => setEditingNotes((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-ink-faint hover:text-violet-soft"
          >
            <NotebookPen className="h-3.5 w-3.5" /> {item.userNotes ? 'Edit notes' : 'Add notes'}
          </button>
        </div>

        {editingNotes ? (
          <div className="mt-2">
            <textarea
              autoFocus
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={2000}
              className="input-field text-xs"
              placeholder="What do you think of this one?"
            />
            <div className="mt-1.5 flex justify-end gap-2">
              <button onClick={() => setEditingNotes(false)} className="text-[11px] text-ink-faint">Cancel</button>
              <button onClick={handleNotesSave} className="text-[11px] font-semibold text-violet-soft">Save</button>
            </div>
          </div>
        ) : item.userNotes ? (
          <p className="mt-2 line-clamp-2 text-xs italic text-ink-muted">"{item.userNotes}"</p>
        ) : null}
      </div>
    </motion.div>
  );
}
