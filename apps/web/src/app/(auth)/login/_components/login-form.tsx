'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login({ email, password });
      if (res.success) {
        toast.success('Successfully logged in');
        router.push('/dashboard');
      } else {
        setError(res.error || 'Invalid credentials');
        toast.error(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid credentials';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-xl animate-in fade-in-50">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@doctortracker.com"
            className="pl-9 h-10 text-xs rounded-xl border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-9 h-10 text-xs rounded-xl border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-10 gap-2 text-xs font-bold rounded-xl shadow-md transition-all duration-200 mt-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <span>Sign In to Portal</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <div className="pt-3.5 border-t border-border/40 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-foreground px-1">
          <span>Demo Account</span>
          <code className="text-foreground font-mono font-medium bg-accent/50 px-2 py-0.5 rounded-md border border-border/40">
            admin@doctortracker.com
          </code>
        </div>
        <div className="flex items-center justify-between text-[11px] text-foreground px-1">
          <span>Demo Password</span>
          <code className="text-foreground font-mono font-medium bg-accent/50 px-2 py-0.5 rounded-md border border-border/40">
            admin123
          </code>
        </div>
      </div>
    </form>
  );
}
