'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Library, BarChart3, LogOut, Disc3 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import EqBars from './EqBars';

const NAV_ITEMS = [
  { href: '/search', label: 'Search', icon: Search },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-void/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/search" className="flex items-center gap-2.5 group">
          <Disc3 className="h-6 w-6 text-violet-soft transition-transform duration-500 group-hover:rotate-180" strokeWidth={1.75} />
          <span className="font-display text-lg font-semibold tracking-tight">Music Catalog Insights Platform</span>
          <EqBars className="ml-1 opacity-70" />
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-full border border-line bg-raised/50 p-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="relative px-4 py-2 rounded-full text-sm font-medium">
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-violet/15 border border-violet/40"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <span className={`relative flex items-center gap-1.5 ${active ? 'text-ink' : 'text-ink-muted hover:text-ink'}`}>
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden sm:inline text-sm text-ink-muted font-mono">
              {user.displayName}
            </span>
          )}
          <button
            onClick={logout}
            className="btn-ghost !px-3 !py-2"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="md:hidden flex items-center justify-around border-t border-line/60 px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs ${
                active ? 'text-violet-soft' : 'text-ink-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
