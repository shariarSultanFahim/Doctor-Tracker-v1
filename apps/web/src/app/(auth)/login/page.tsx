import LoginForm from './_components/login-form';
import { Activity, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-slate-900 text-foreground">
      {/* Background Image with Next.js Image Component */}
      <Image
        src="/medical-equipment-desk.jpg"
        alt="Medical Equipment Desk Background"
        fill
        priority
        className="object-cover object-center pointer-events-none z-0"
      />

      {/* Dark overlay tint for rich contrast */}
      <div className="absolute inset-0 bg-black/45 pointer-events-none z-0" />

      {/* Main Glassmorphism Login Container */}
      <div className="w-full max-w-md glass-card rounded-3xl p-8 space-y-6 shadow-2xl relative z-10 border border-white/20">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 text-primary shadow-sm mb-1 backdrop-blur-md">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black tracking-tight">Doctor Tracker</h1>
            <p className="text-xs text-foreground mt-1 font-medium">Medical Administration Portal</p>
          </div>
          <div className="flex justify-center pt-1">
            <Badge variant="outline" className="text-[10px] bg-accent text-accent-foreground border-border/60 gap-1 px-2.5 py-0.5">
              <ShieldCheck className="h-3 w-3 text-primary" />
              Secure Enterprise Access
            </Badge>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
