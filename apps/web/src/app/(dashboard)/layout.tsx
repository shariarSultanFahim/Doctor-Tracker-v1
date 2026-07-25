'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, UserCheck, Users, LogOut, Activity } from 'lucide-react';
import { logout } from '@/lib/api/auth';
import { toast } from 'sonner';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Doctors', href: '/doctors', icon: UserCheck },
  { name: 'Patients', href: '/patients', icon: Users },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 px-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">Doctor Tracker</span>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-600" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
            {pathname.split('/')[1] || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-semibold flex items-center justify-center text-xs">
              AD
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">Admin User</span>
          </div>
        </header>
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
