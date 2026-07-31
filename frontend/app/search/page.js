'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { motion } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AlbumCard from '@/components/AlbumCard';
import SkeletonGrid from '@/components/SkeletonGrid';
import EmptyState from '@/components/EmptyState';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { searchApi, libraryApi, getErrorMessage } from '@/lib/api';
import { useToast } from '@/lib/toast-context';

export default function SearchPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { push } = useToast();

  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 450);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);

  // Preload library ids so "already saved" state is accurate.
  useEffect(() => {
    if (!user) return;
    libraryApi.list().then(({ data }) => {
      setSavedIds(new Set(data.map((item) => item.appleCatalogId)));
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setSearching(true);
    setHasSearched(true);
    searchApi.search(debouncedQuery, 'album', 24)
      .then(({ data }) => setResults(data))
      .catch((err) => push(getErrorMessage(err), 'error'))
      .finally(() => setSearching(false));
  }, [debouncedQuery, push]);

  const handleSave = useCallback(async (album) => {
    setSavingId(album.appleCatalogId);
    try {
      await libraryApi.save({
        appleCatalogId: album.appleCatalogId,
        title: album.title,
        artistName: album.artistName,
        genre: album.genre,
        releaseDate: album.releaseDate,
        trackCount: album.trackCount,
        artworkUrl: album.artworkUrl,
        collectionPrice: album.collectionPrice,
      });
      setSavedIds((prev) => new Set(prev).add(album.appleCatalogId));
      push(`Saved "${album.title}" to your library`, 'success');
    } catch (err) {
      push(getErrorMessage(err), 'error');
    } finally {
      setSavingId(null);
    }
  }, [push]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <span className="label-eyebrow">Public catalog · iTunes Search API</span>
          <h1 className="mt-2 font-display text-3xl font-semibold">Find your next favorite album</h1>
          <p className="mt-1.5 text-sm text-ink-muted">Search by artist, album title, or keyword. Results are live from Apple's catalog.</p>
        </motion.div>

        <div className="relative mt-6 max-w-xl">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “Coldplay”, “Discovery”, or “90s hip hop”…"
            className="input-field !pl-11"
          />
        </div>

        <div className="mt-8">
          {searching && <SkeletonGrid count={10} />}

          {!searching && hasSearched && results.length === 0 && (
            <EmptyState
              title="No albums found"
              body={`We couldn't find anything matching "${debouncedQuery}". Try a different spelling or a broader term.`}
            />
          )}

          {!searching && !hasSearched && (
            <EmptyState
              title="Start typing to search"
              body="Every result comes straight from the iTunes catalog — search for an artist or album to get going."
            />
          )}

          {!searching && results.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {results.map((album, i) => (
                <AlbumCard
                  key={album.appleCatalogId}
                  album={album}
                  index={i}
                  saved={savedIds.has(album.appleCatalogId)}
                  saving={savingId === album.appleCatalogId}
                  onSave={handleSave}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
