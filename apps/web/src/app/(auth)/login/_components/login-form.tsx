'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Lock, Mail, Loader2 } from 'lucide-react';

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
        <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@doctortracker.com"
            className="pl-9 h-9 text-xs"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-9 h-9 text-xs"
            required
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full gap-2 text-xs font-semibold"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
      </Button>
    </form>
  );
}
