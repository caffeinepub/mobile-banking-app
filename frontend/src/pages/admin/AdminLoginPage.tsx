import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Lock, User, AlertCircle, Loader2, Shield } from 'lucide-react';
import { validateAdminCredentials, setAdminToken, generateAdminToken, isAdminAuthenticated } from '../../utils/adminAuth';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated as admin
  React.useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate({ to: '/admin/dashboard' });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (validateAdminCredentials(username, password)) {
      const token = generateAdminToken(username, password);
      setAdminToken(token);
      navigate({ to: '/admin/dashboard' });
    } else {
      setError('Invalid username or password. Access denied.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Logo / Header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className="text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-muted-foreground text-sm mt-1">NuroPay Administration</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin username"
                autoComplete="username"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                autoComplete="current-password"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl text-destructive text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield size={18} />
                Login to Admin Panel
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Authorized personnel only. All access is logged.
      </p>
    </div>
  );
}
