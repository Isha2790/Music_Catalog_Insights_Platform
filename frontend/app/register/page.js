'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, AlertCircle } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await register(form.email, form.displayName, form.password);
    setSubmitting(false);
    if (result.ok) {
      router.push('/search');
    } else {
      setError(result.message);
    }
  }

  return (
    <AuthLayout
      title="Create your library"
      subtitle="Takes 20 seconds. No email verification needed for this demo."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-violet-soft hover:text-amber transition-colors">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">Display name</label>
          <input
            required
            autoFocus
            className="input-field"
            placeholder="Alex Rivera"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">Email</label>
          <input
            type="email"
            required
            className="input-field"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="input-field"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating account…' : (<><UserPlus className="h-4 w-4" /> Create account</>)}
        </button>
      </form>
    </AuthLayout>
  );
}
