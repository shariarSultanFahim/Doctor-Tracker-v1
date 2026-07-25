import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Doctor Tracker Admin Portal',
  description: 'Manage doctors, patient rosters, and analytical dashboards',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
