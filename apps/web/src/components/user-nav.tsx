'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { logout } from '@/lib/api/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function UserNav() {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const userName = user?.name || 'Admin User';
  const userEmail = user?.email || 'admin@doctortracker.com';
  const userAvatar = user?.avatar;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 outline-none p-1.5 px-2 rounded-full hover:bg-accent/50 transition-colors cursor-pointer">
        <Avatar className="h-8 w-8 border border-border shrink-0">
          {userAvatar ? <AvatarImage src={userAvatar} alt={userName} className="object-cover" /> : null}
          <AvatarFallback className="font-semibold text-xs">{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-semibold text-foreground truncate max-w-[160px]">
          {userName}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 glass-card mt-1">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
