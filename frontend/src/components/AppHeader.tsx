import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';
import { useGetUserNotifications } from '../hooks/useQueries';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function AppHeader({ title, showBack, onBack }: AppHeaderProps) {
  const navigate = useNavigate();
  const { userId, userName } = useAuthStore();
  const { data: notifications } = useGetUserNotifications(userId);
  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              onClick={onBack || (() => navigate({ to: '/home' }))}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/nuropay-logo.dim_128x128.png"
                alt="NuroPay"
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <span className="font-display font-bold text-base text-gray-900">NuroPay</span>
                {userName && (
                  <p className="text-[10px] text-gray-500 leading-none">Hi, {userName.split(' ')[0]}</p>
                )}
              </div>
            </div>
          )}
          {title && showBack && (
            <span className="font-semibold text-gray-900 text-base ml-1">{title}</span>
          )}
        </div>

        {!showBack && (
          <button
            onClick={() => navigate({ to: '/notifications' })}
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Bell size={22} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
