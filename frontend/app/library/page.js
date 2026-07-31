'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Search as SearchIcon, Library as LibraryIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LibraryCard from '@/components/LibraryCard';
import EmptyState from '@/components/EmptyState';
import SkeletonGrid from '@/components/SkeletonGrid';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { libraryApi, getErrorMessage } from '@/lib/api';
import { useToast } from '@/lib/toast-context';

export default function LibraryPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { push } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLibrary = useCallback(() => {
    setLoading(true);
    libraryApi.list()
      .then(({ data }) => setItems(data))
      .catch((err) => push(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [push]);

  useEffect(() => {
    if (user) loadLibrary();
  }, [user, loadLibrary]);

  async function handleUpdate(id, payload) {
    const previous = items;
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...payload } : it)));
    try {
      await libraryApi.update(id, payload);
    } catch (err) {
      setItems(previous);
      push(getErrorMessage(err), 'error');
    }
  }

  async function handleDelete(id) {
    try {
      await libraryApi.remove(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      push('Removed from your library', 'success');
    } catch (err) {
      push(getErrorMessage(err), 'error');
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between">
          <div>
            <span className="label-eyebrow">Your collection</span>
            <h1 className="mt-2 font-display text-3xl font-semibold">Library</h1>
            <p className="mt-1.5 text-sm text-ink-muted">
              {loading ? 'Loading…' : `${items.length} album${items.length === 1 ? '' : 's'} saved`}
            </p>
          </div>
          <Link href="/search" className="btn-primary hidden sm:inline-flex">
            <SearchIcon className="h-4 w-4" /> Find more
          </Link>
        </motion.div>

        <div className="mt-8">
          {loading && <SkeletonGrid count={6} />}

          {!loading && items.length === 0 && (
            <EmptyState
              icon={LibraryIcon}
              title="Your library is empty"
              body="Search the catalog and save a few albums to start building your collection."
              action={<Link href="/search" className="btn-primary mt-2">Start searching</Link>}
            />
          )}

          {!loading && items.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence>
                {items.map((item, i) => (
                  <LibraryCard
                    key={item.id}
                    item={item}
                    index={i}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
