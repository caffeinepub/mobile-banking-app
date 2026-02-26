import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import TransactionListItem from '../components/TransactionListItem';
import TransactionSlip from '../components/TransactionSlip';
import { useAuthStore } from '../store/authStore';
import { useGetUserTransactions } from '../hooks/useQueries';
import { Transaction } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { History } from 'lucide-react';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useAuthStore();
  const { data: transactions, isLoading } = useGetUserTransactions(userId);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!isLoggedIn) navigate({ to: '/login' });
  }, [isLoggedIn, navigate]);

  const sorted = [...(transactions || [])].sort((a, b) => Number(b.createdAt - a.createdAt));

  if (selectedTx) {
    return (
      <div className="app-container">
        <AppHeader title="Transaction Slip" showBack onBack={() => setSelectedTx(null)} />
        <div className="px-4 py-5">
          <TransactionSlip transaction={selectedTx} onClose={() => setSelectedTx(null)} />
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <AppHeader title="Transaction History" showBack onBack={() => navigate({ to: '/home' })} />
      <div className="px-4 py-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <History size={28} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">No Transactions Yet</h3>
            <p className="text-sm text-gray-400">Your transaction history will appear here</p>
          </div>
        ) : (
          sorted.map(tx => (
            <TransactionListItem
              key={tx.id}
              transaction={tx}
              onClick={() => setSelectedTx(tx)}
            />
          ))
        )}
      </div>
    </Layout>
  );
}
