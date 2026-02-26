import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Send, Smartphone, PlusCircle, Receipt, Banknote,
  Building2, PiggyBank, History, User
} from 'lucide-react';

const services = [
  { label: 'Send Money', icon: Send, path: '/send-money', color: 'bg-blue-100 text-blue-600' },
  { label: 'Recharge', icon: Smartphone, path: '/recharge', color: 'bg-purple-100 text-purple-600' },
  { label: 'Add Money', icon: PlusCircle, path: '/add-money', color: 'bg-green-100 text-green-600' },
  { label: 'Pay Bill', icon: Receipt, path: '/pay-bill', color: 'bg-orange-100 text-orange-600' },
  { label: 'Cash Out', icon: Banknote, path: '/cash-out', color: 'bg-red-100 text-red-600' },
  { label: 'Bank Tx', icon: Building2, path: '/bank-transfer', color: 'bg-indigo-100 text-indigo-600' },
  { label: 'Savings', icon: PiggyBank, path: '/savings', color: 'bg-yellow-100 text-yellow-600' },
  { label: 'History', icon: History, path: '/history', color: 'bg-teal-100 text-teal-600' },
  { label: 'My Info', icon: User, path: '/profile', color: 'bg-pink-100 text-pink-600' },
];

export default function ServiceGrid() {
  const navigate = useNavigate();

  return (
    <div className="mx-4 mt-5">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Services</h2>
      <div className="grid grid-cols-3 gap-3">
        {services.map(({ label, icon: Icon, path, color }) => (
          <button
            key={path}
            onClick={() => navigate({ to: path })}
            className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl card-shadow hover:shadow-card-md active:scale-95 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={22} />
            </div>
            <span className="text-xs font-medium text-gray-700 text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
