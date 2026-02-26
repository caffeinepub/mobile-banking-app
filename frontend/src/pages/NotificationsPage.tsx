import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import NotificationItem from '../components/NotificationItem';
import { useAuthStore } from '../store/authStore';
import { useGetUserNotifications, useMarkNotificationRead } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useAuthStore();
  const { data: notifications, isLoading } = useGetUserNotifications(userId);
  const markRead = useMarkNotificationRead();

  useEffect(() => {
    if (!isLoggedIn) navigate({ to: '/login' });
  }, [isLoggedIn, navigate]);

  const sorted = [...(notifications || [])].sort((a, b) => Number(b.createdAt - a.createdAt));

  const handleRead = (notifId: string) => {
    if (!userId) return;
    markRead.mutate({ userId, notificationId: notifId });
  };

  return (
    <Layout>
      <AppHeader title="Notifications" showBack onBack={() => navigate({ to: '/home' })} />
      <div className="px-4 py-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Bell size={28} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">No Notifications</h3>
            <p className="text-sm text-gray-400">You'll see announcements and updates here</p>
          </div>
        ) : (
          sorted.map(n => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={() => !n.isRead && handleRead(n.id)}
            />
          ))
        )}
      </div>
    </Layout>
  );
}
