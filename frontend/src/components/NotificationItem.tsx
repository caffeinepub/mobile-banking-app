import React from 'react';
import { NotificationWithRead } from '../backend';
import { formatDate } from '../utils/validation';
import { Bell, BellOff } from 'lucide-react';

interface NotificationItemProps {
  notification: NotificationWithRead;
  onRead: () => void;
}

export default function NotificationItem({ notification, onRead }: NotificationItemProps) {
  return (
    <button
      onClick={onRead}
      className={`w-full text-left p-4 rounded-xl transition-all ${
        notification.isRead
          ? 'bg-white card-shadow'
          : 'bg-primary-50 border border-primary-100 card-shadow'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          notification.isRead ? 'bg-gray-100' : 'bg-primary-100'
        }`}>
          {notification.isRead
            ? <BellOff size={16} className="text-gray-400" />
            : <Bell size={16} className="text-primary-500" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`text-sm font-semibold truncate ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
              {notification.title}
            </h4>
            {!notification.isRead && (
              <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.body}</p>
          <p className="text-[10px] text-gray-300 mt-1">{formatDate(notification.createdAt)}</p>
        </div>
      </div>
    </button>
  );
}
