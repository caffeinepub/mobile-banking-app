import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Send,
  Smartphone,
  PlusCircle,
  Receipt,
  Banknote,
  Building2,
  PiggyBank,
  Bell,
  User,
  History,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useGetUserNotifications } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export default function HomePage() {
  const navigate = useNavigate();
  const { userId, balance, isAuthenticated, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [showBalance, setShowBalance] = React.useState(true);

  const { data: notifications } = useGetUserNotifications(userId || '');
  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, userId, navigate]);

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  const services = [
    { label: 'Send Money', icon: <Send size={22} />, path: '/send-money', color: 'bg-blue-50 text-blue-600' },
    { label: 'Recharge', icon: <Smartphone size={22} />, path: '/recharge', color: 'bg-purple-50 text-purple-600' },
    { label: 'Add Money', icon: <PlusCircle size={22} />, path: '/add-money', color: 'bg-green-50 text-green-600' },
    { label: 'Pay Bill', icon: <Receipt size={22} />, path: '/pay-bill', color: 'bg-orange-50 text-orange-600' },
    { label: 'Cash Out', icon: <Banknote size={22} />, path: '/cash-out', color: 'bg-red-50 text-red-600' },
    { label: 'Bank Transfer', icon: <Building2 size={22} />, path: '/bank-transfer', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Savings', icon: <PiggyBank size={22} />, path: '/savings', color: 'bg-teal-50 text-teal-600' },
    { label: 'History', icon: <History size={22} />, path: '/history', color: 'bg-gray-50 text-gray-600' },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary px-4 pt-10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              <img src="/assets/generated/nuropay-logo.dim_128x128.png" alt="NuroPay" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-white font-bold text-lg">NuroPay</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate({ to: '/notifications' })}
              className="relative w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate({ to: '/profile' })}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white"
            >
              <User size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white/15 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/80 text-sm">Available Balance</span>
            <button onClick={() => setShowBalance(!showBalance)} className="text-white/80">
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="text-3xl font-bold text-white">
            {showBalance ? `৳${balance.toFixed(2)}` : '৳••••••'}
          </div>
          <div className="text-white/60 text-xs mt-1">User ID: {userId}</div>
        </div>
      </header>

      {/* Announcement Marquee */}
      {notifications && notifications.length > 0 && (
        <div className="bg-accent/10 border-b border-accent/20 px-4 py-2 overflow-hidden">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-accent shrink-0" />
            <div className="overflow-hidden">
              <p className="text-xs text-accent font-medium truncate">
                {notifications[notifications.length - 1]?.title}: {notifications[notifications.length - 1]?.body}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <main className="flex-1 px-4 py-5">
        <h2 className="text-base font-bold text-foreground mb-4">Services</h2>
        <div className="grid grid-cols-4 gap-3">
          {services.map((service) => (
            <button
              key={service.label}
              onClick={() => navigate({ to: service.path as any })}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${service.color}`}>
                {service.icon}
              </div>
              <span className="text-xs text-foreground font-medium text-center leading-tight">{service.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 space-y-2">
          <h2 className="text-base font-bold text-foreground mb-3">Quick Actions</h2>
          {[
            { label: 'Transaction History', path: '/history', icon: <History size={18} /> },
            { label: 'KYC Verification', path: '/kyc', icon: <User size={18} /> },
            { label: 'Notifications', path: '/notifications', icon: <Bell size={18} /> },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate({ to: item.path as any })}
              className="w-full flex items-center justify-between p-3 bg-card border border-border rounded-xl"
            >
              <div className="flex items-center gap-3 text-foreground">
                <span className="text-muted-foreground">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} NuroPay. Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
