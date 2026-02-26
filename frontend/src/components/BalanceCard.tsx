import React, { useState } from 'react';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';
import { formatBDT } from '../utils/validation';

interface BalanceCardProps {
  balance: number;
  userName: string;
  mobile: string;
}

export default function BalanceCard({ balance, userName, mobile }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="mx-4 mt-4 rounded-2xl green-gradient p-5 text-white card-shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Total Balance</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-display font-bold">
              {showBalance ? `৳${formatBDT(balance)}` : '৳ ••••••'}
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <div className="bg-white/20 rounded-xl p-2">
          <TrendingUp size={20} />
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-white/20">
        <div>
          <p className="text-white/70 text-[10px] uppercase tracking-wider">Account Holder</p>
          <p className="text-white font-semibold text-sm">{userName}</p>
        </div>
        <div className="text-right">
          <p className="text-white/70 text-[10px] uppercase tracking-wider">Mobile</p>
          <p className="text-white font-semibold text-sm">{mobile}</p>
        </div>
      </div>
    </div>
  );
}
