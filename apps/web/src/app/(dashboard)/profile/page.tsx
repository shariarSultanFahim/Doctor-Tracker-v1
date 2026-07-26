'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import AvatarWithFallback from '@/components/shared/avatar-with-fallback';
import { Badge } from '@/components/ui/badge';
import ThemeSelector from './_components/theme-selector';
import ProfileInfoForm from './_components/profile-info-form';
import ChangePasswordForm from './_components/change-password-form';
import { Camera, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (user?.avatar) {
      setAvatar(user.avatar);
    }
  }, [user?.avatar]);

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
            <AvatarWithFallback
              src={avatar || user?.avatar}
              name={user?.name || 'Admin'}
              className="w-24 h-24 text-2xl font-bold border-2 border-primary/20 shadow-md"
            />
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
            <h2 className="text-lg font-bold text-foreground">{user?.name || 'Admin User'}</h2>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <Badge variant="outline" className="mt-2 text-xs bg-primary/10 text-primary border-primary/20">
              <ShieldCheck className="h-3 w-3 mr-1 text-primary" /> System Administrator
            </Badge>
          </div>
        </div>

        {/* Profile Information, Security & Theme Components */}
        <div className="space-y-6 md:col-span-2">
          {/* Modularized Theme Selector Component under profile route */}
          <ThemeSelector />

          {/* Modularized Account Information Form using react-hook-form + zod */}
          <ProfileInfoForm avatar={avatar} />

          {/* Modularized Change Password Form using react-hook-form + zod */}
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
