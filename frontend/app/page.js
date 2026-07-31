'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Sparkles, BarChart3 } from 'lucide-react';
import VinylRecord from '@/components/VinylRecord';
import EqBars from '@/components/EqBars';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const FEATURES = [
  {
    icon: Search,
    title: 'Search the real catalog',
    body: 'Every album is pulled live from the public iTunes Search API — no fixtures, no mock data.',
  },
  {
    icon: BarChart3,
    title: 'See your library, charted',
    body: 'Genre spread, decade trends, top artists, and rating patterns rendered the moment you save something.',
  },
  {
    icon: Sparkles,
    title: 'AI-generated trend summary',
    body: 'A heuristic insight engine reads your saved albums and writes a short, human summary of your taste.',
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/search');
  }, [user, loading, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-void">
      <div className="relative mx-auto flex max-w-6xl flex-col px-6 pt-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold">Music</span>
            <EqBars className="opacity-70" />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost">Log in</Link>
            <Link href="/register" className="btn-primary">Get started</Link>
          </div>
        </div>

        {/* Hero */}
        <section className="grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="label-eyebrow">Music Catalog Insights Platform · full-stack + AI</span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
              Your record collection,
              <br />
              <span className="bg-gradient-to-r from-violet-soft to-amber bg-clip-text text-transparent">
                understood.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-base text-ink-muted">
              Search the public music catalog, build a personal album library, and
              let an insight engine tell you what your taste actually says about you.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link href="/register" className="btn-primary">
                Build your library <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="btn-ghost">I already have an account</Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
            className="flex justify-center md:justify-end"
          >
            <div className="relative">
              <div className="absolute -inset-10 rounded-full bg-violet/20 blur-3xl" />
              <VinylRecord size={280} />
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="grid gap-5 border-t border-line/60 py-16 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card p-6"
            >
              <f.icon className="h-5 w-5 text-amber" strokeWidth={1.75} />
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.body}</p>
            </motion.div>
          ))}
        </section>

        <footer className="border-t border-line/60 py-8 text-center text-xs text-ink-faint">
          Built with Spring Boot, Next.js, and the{' '}
          <a
            href="https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTunesSearchAPI/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-muted underline decoration-line underline-offset-4 transition-colors hover:text-violet-soft hover:decoration-violet-soft"
          >
            iTunes Search API
          </a>
          .
        </footer>
      </div>
    </main>
  );
}
