import LoginForm from './_components/login-form';
import { Activity } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-sky-50 text-sky-600 rounded-xl mb-2">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Tracker</h1>
          <p className="text-sm text-slate-500">Sign in to access the admin portal</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
