'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import Navbar from '@/components/Navbar';
import ChartCard from '@/components/ChartCard';
import Footer from '@/components/Footer';
import InsightsPanel from '@/components/InsightsPanel';
import EmptyState from '@/components/EmptyState';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { analyticsApi, insightsApi, getErrorMessage } from '@/lib/api';
import { useToast } from '@/lib/toast-context';

const PALETTE = ['#7C5CFF', '#FFB84D', '#5EEAD4', '#F472B6', '#818CF8', '#FCD34D', '#34D399', '#FB923C'];

const TOOLTIP_STYLE = {
  background: '#1D1B29',
  border: '1px solid #2A2836',
  borderRadius: 10,
  fontSize: 12,
  color: '#F4F2FA',
};

function StatPill({ label, value }) {
  return (
    <div className="card px-5 py-4">
      <p className="text-[11px] font-mono uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { push } = useToast();
  const [stats, setStats] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingInsight, setLoadingInsight] = useState(true);

  useEffect(() => {
    if (!user) return;
    analyticsApi.get()
      .then(({ data }) => setStats(data))
      .catch((err) => push(getErrorMessage(err), 'error'))
      .finally(() => setLoadingStats(false));

    insightsApi.get()
      .then(({ data }) => setInsight(data))
      .catch((err) => push(getErrorMessage(err), 'error'))
      .finally(() => setLoadingInsight(false));
  }, [user, push]);

  if (authLoading || !user) return null;

  const isEmpty = !loadingStats && stats && stats.totalAlbums === 0;

  const genreData = stats ? Object.entries(stats.genreDistribution).map(([name, value]) => ({ name, value })) : [];
  const yearData = stats ? Object.entries(stats.releasesByYear).map(([year, count]) => ({ year, count })) : [];
  const ratingData = stats ? Object.entries(stats.ratingDistribution).map(([stars, count]) => ({ stars: `${stars}★`, count })) : [];
  const decadeData = stats ? Object.entries(stats.decadeDistribution).map(([decade, count]) => ({ decade, count })) : [];
  const artistData = stats ? [...stats.topArtists].reverse().map((a) => ({ name: a.artistName, albums: a.albumCount })) : [];

  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <span className="label-eyebrow">Your library, quantified</span>
          <h1 className="mt-2 font-display text-3xl font-semibold">Analytics</h1>
          <p className="mt-1.5 text-sm text-ink-muted">Genre spread, release eras, ratings, and your most-collected artists.</p>
        </motion.div>

        {isEmpty ? (
          <div className="mt-8">
            <EmptyState
              title="No data yet"
              body="Save a few albums to your library first — charts and AI insights will appear here automatically."
              action={<Link href="/search" className="btn-primary mt-2">Start searching</Link>}
            />
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatPill label="Albums saved" value={loadingStats ? '—' : stats.totalAlbums} />
              <StatPill label="Total tracks" value={loadingStats ? '—' : stats.totalTracks} />
              <StatPill label="Avg. rating" value={loadingStats ? '—' : `${stats.averageRating.toFixed(1)} ★`} />
              <StatPill label="Avg. tracklist" value={loadingStats ? '—' : `${stats.averageTrackCount.toFixed(0)} tracks`} />
            </div>

            <div className="mt-6">
              <InsightsPanel insight={insight} loading={loadingInsight} />
            </div>

            {!loadingStats && (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <ChartCard title="Genre distribution" subtitle="Share of your library by genre" delay={0}>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={genreData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {genreData.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 11, color: '#9C98AE' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Releases by year" subtitle="When your saved albums were originally released" delay={0.05}>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={yearData}>
                      <CartesianGrid stroke="#2A2836" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6B6780' }} axisLine={{ stroke: '#2A2836' }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B6780' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Line type="monotone" dataKey="count" stroke="#7C5CFF" strokeWidth={2.5} dot={{ fill: '#FFB84D', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Rating distribution" subtitle="How you've rated your saved albums" delay={0.1}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={ratingData}>
                      <CartesianGrid stroke="#2A2836" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="stars" tick={{ fontSize: 11, fill: '#6B6780' }} axisLine={{ stroke: '#2A2836' }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B6780' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(124,92,255,0.08)' }} />
                      <Bar dataKey="count" fill="#7C5CFF" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Top artists" subtitle="Most-collected artists in your library" delay={0.15}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={artistData} layout="vertical" margin={{ left: 24 }}>
                      <CartesianGrid stroke="#2A2836" strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#6B6780' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#9C98AE' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,184,77,0.08)' }} />
                      <Bar dataKey="albums" fill="#FFB84D" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Releases by decade" subtitle="A histogram view of your library's era spread" delay={0.2}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={decadeData}>
                      <CartesianGrid stroke="#2A2836" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="decade" tick={{ fontSize: 11, fill: '#6B6780' }} axisLine={{ stroke: '#2A2836' }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B6780' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(94,234,212,0.08)' }} />
                      <Bar dataKey="count" fill="#5EEAD4" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
