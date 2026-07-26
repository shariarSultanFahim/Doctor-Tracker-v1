'use client';

import AvatarWithFallback from '@/components/shared/avatar-with-fallback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { Camera, Loader2, Lock, Mail, Monitor, Moon, Save, ShieldCheck, Sun, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, isLoading, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || '');
      setThemeMode(user.theme || 'system');
    }
  }, [user]);

  // Handle Theme Toggle
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

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        name,
        email,
        avatar,
      });
      toast.success('Profile details saved');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        currentPassword,
        newPassword,
      });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground glass-card">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
        Loading profile settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl font-bold text-foreground">Admin Profile & Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your personal credentials, table preferences, and visual theme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="glass-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center space-y-4 md:col-span-1">
          <div className="relative group cursor-pointer">
            <AvatarWithFallback src={avatar} name={name} className="w-24 h-24 text-2xl font-bold border-2 border-primary/20 shadow-md" />
            <label
              htmlFor="profile-avatar"
              className="absolute inset-0 bg-black/60 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold"
            >
              <Camera className="h-5 w-5 mb-1" />
              Change
            </label>
            <input id="profile-avatar" type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">{name || 'Admin User'}</h2>
            <p className="text-xs text-muted-foreground">{email}</p>
            <Badge variant="outline" className="mt-2 text-xs bg-primary/10 text-primary border-primary/20">
              <ShieldCheck className="h-3 w-3 mr-1 text-primary" /> System Administrator
            </Badge>
          </div>
        </div>

        {/* Profile Information & Security Form */}
        <div className="space-y-6 md:col-span-2">
          {/* Theme Preferences Card */}
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

          {/* Edit Profile Form */}
          <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">Account Information</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={updateProfile.isPending} className="gap-2 text-xs">
                  {updateProfile.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Profile
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" variant="outline" disabled={updateProfile.isPending} className="gap-2 text-xs">
                  {updateProfile.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
