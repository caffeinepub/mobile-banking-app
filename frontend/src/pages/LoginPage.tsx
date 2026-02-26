import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useRegisterUser, useLoginUser } from '../hooks/useQueries';
import { useAuthStore } from '../store/authStore';

type Tab = 'login' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [tab, setTab] = useState<Tab>('login');

  React.useEffect(() => {
    if (isLoggedIn) {
      navigate({ to: '/home' });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary px-6 pt-12 pb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            <img
              src="/assets/generated/nuropay-logo.dim_128x128.png"
              alt="NuroPay"
              className="w-10 h-10 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">NuroPay</h1>
            <p className="text-white/80 text-sm">Bangladesh's Trusted Mobile Banking</p>
          </div>
        </div>
        <p className="text-white/70 text-sm font-medium mt-2">Fast, Secure &amp; Reliable</p>
      </div>

      {/* Content */}
      <div className="flex-1 bg-background rounded-t-3xl -mt-4 px-6 pt-6 pb-8">
        {/* Tab Switcher */}
        <div className="flex bg-muted rounded-full p-1 mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === 'login'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === 'register'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            Register
          </button>
        </div>

        {tab === 'login' ? <LoginForm /> : <RegisterForm onSuccess={() => setTab('login')} />}
      </div>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const loginMutation = useLoginUser();

  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mobile || mobile.length < 11) {
      setError('Please enter a valid mobile number (01XXXXXXXXX)');
      return;
    }
    if (!pin || pin.length !== 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }

    try {
      const userId = await loginMutation.mutateAsync({ mobile, pin });
      setUser(userId, mobile, mobile);
      navigate({ to: '/home' });
    } catch (err: any) {
      const msg = err?.message || 'Login failed';
      if (msg.includes('Device mismatch') || msg.includes('device')) {
        setError('এই ডিভাইস থেকে লগইন করা যাচ্ছে না। সাপোর্টে যোগাযোগ করুন: +8809606945622');
      } else if (msg.includes('Invalid PIN')) {
        setError('ভুল PIN। আবার চেষ্টা করুন।');
      } else if (msg.includes('User not found') || msg.includes('not found')) {
        setError('এই মোবাইল নম্বরে কোনো অ্যাকাউন্ট নেই।');
      } else {
        setError(msg);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Mobile Number</label>
        <input
          type="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="01XXXXXXXXX"
          maxLength={11}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">4-Digit PIN</label>
        <div className="relative">
          <input
            type={showPin ? 'text' : 'password'}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
            maxLength={4}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-xl text-destructive text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const registerMutation = useRegisterUser();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!mobile || !/^01[3-9]\d{8}$/.test(mobile)) {
      setError('Please enter a valid Bangladeshi mobile number (01XXXXXXXXX)');
      return;
    }
    if (!pin || pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    try {
      await registerMutation.mutateAsync({ mobile, pin, name });
      setSuccess('Account created successfully! Please login with your credentials.');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      const msg = err?.message || 'Registration failed';
      if (msg.includes('already registered')) {
        setError('এই মোবাইল নম্বর ইতিমধ্যে নিবন্ধিত। লগইন করুন।');
      } else {
        setError(msg);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="আপনার পূর্ণ নাম"
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Mobile Number</label>
        <input
          type="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="01XXXXXXXXX"
          maxLength={11}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">4-Digit PIN</label>
        <div className="relative">
          <input
            type={showPin ? 'text' : 'password'}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
            maxLength={4}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Confirm PIN</label>
        <input
          type="password"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="••••"
          maxLength={4}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-xl text-destructive text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl text-green-700 text-sm">
          <CheckCircle size={16} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={registerMutation.isPending}
        className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {registerMutation.isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  );
}
