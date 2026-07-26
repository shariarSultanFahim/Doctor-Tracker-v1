'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeSelector() {
  const { user, updateProfile } = useAuth();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    if (user?.theme) {
      setThemeMode(user.theme);
    }
  }, [user?.theme]);

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else if (mode === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    updateProfile.mutate({ theme: mode });
  };

  return (
    <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-3">
      <h3 className="text-sm font-bold text-foreground">Visual Theme & Interface Settings</h3>
      <p className="text-xs text-muted-foreground">Choose your preferred visual mode for the Doctor Tracker portal</p>

      <div className="pt-2">
        <Tabs value={themeMode} onValueChange={(val) => handleThemeChange(val as any)}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="light" className="gap-2 text-xs">
              <Sun className="h-3.5 w-3.5" /> Light
            </TabsTrigger>
            <TabsTrigger value="dark" className="gap-2 text-xs">
              <Moon className="h-3.5 w-3.5" /> Dark
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2 text-xs">
              <Monitor className="h-3.5 w-3.5" /> System
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
