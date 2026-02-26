import React from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Home, History, Bell, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useGetUserNotifications } from '../hooks/useQueries';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/notifications', icon: Bell, label: 'Alerts' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useAuthStore();
  const { data: notifications } = useGetUserNotifications(userId);
  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 z-50 bottom-nav-safe shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate({ to: path })}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors relative ${
                isActive ? 'text-primary-500' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {path === '/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary-500' : 'text-gray-400'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
