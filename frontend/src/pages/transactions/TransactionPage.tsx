import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Layout from '../../components/Layout';
import AppHeader from '../../components/AppHeader';
import ConfirmationModal from '../../components/ConfirmationModal';
import ProcessingScreen from '../../components/ProcessingScreen';
import TransactionSlip from '../../components/TransactionSlip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '../../store/authStore';
import { useCreateTransaction, useGetUserTransactions } from '../../hooks/useQueries';
import { TransactionType, Transaction, TransactionStatus } from '../../backend';
import { formatBDT } from '../../utils/validation';
import { AlertCircle, ShieldAlert } from 'lucide-react';

type TxStep = 'form' | 'confirm' | 'processing' | 'slip';

interface Field {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  options?: { value: string; label: string }[];
}

interface TransactionPageProps {
  title: string;
  txType: TransactionType;
  fields: Field[];
  recipientKey?: string;
  providerKey?: string;
}

export default function TransactionPage({
  title,
  txType,
  fields,
  recipientKey = 'recipient',
  providerKey = 'provider',
}: TransactionPageProps) {
  const navigate = useNavigate();
  const { userId, kycStatus, isLoggedIn, userBalance, setBalance } = useAuthStore();
  const [step, setStep] = useState<TxStep>('form');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  const createTx = useCreateTransaction();
  const { refetch } = useGetUserTransactions(userId);

  useEffect(() => {
    if (!isLoggedIn) navigate({ to: '/login' });
  }, [isLoggedIn, navigate]);

  const handleSubmit = () => {
    setError('');
    if (kycStatus !== 'approved') {
      setError('KYC verification required before making transactions.');
      return;
    }
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (amt > userBalance) {
      setError(`Insufficient balance. Available: ৳${formatBDT(userBalance)}`);
      return;
    }
    for (const field of fields) {
      if (!formData[field.key]) {
        setError(`Please fill in ${field.label}`);
        return;
      }
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setStep('processing');
    const amt = parseFloat(amount);
    try {
      const txId = await createTx.mutateAsync({
        userId: userId!,
        txType,
        amount: amt,
        recipient: formData[recipientKey] || '',
        provider: formData[providerKey] || '',
      });

      // Update local balance
      setBalance(userBalance - amt);

      // Try to fetch the created transaction
      const result = await refetch();
      const tx = result.data?.find((t) => t.id === txId);

      if (tx) {
        setCompletedTx(tx);
      } else {
        // Construct a local transaction object for display
        const localTx: Transaction = {
          id: txId,
          userId: userId!,
          txType,
          amount: amt,
          recipient: formData[recipientKey] || '',
          provider: formData[providerKey] || '',
          status: TransactionStatus.processing,
          slipData: '',
          createdAt: BigInt(Date.now() * 1_000_000),
        };
        setCompletedTx(localTx);
      }
      setStep('slip');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      if (msg.includes('disabled') || msg.includes('offline') || msg.includes('currently disabled')) {
        setError('Transaction system is currently offline. Please try again later.');
      } else if (msg.includes('KYC')) {
        setError('KYC verification required. Please complete your KYC first.');
      } else if (msg.includes('Insufficient')) {
        setError('Insufficient balance for this transaction.');
      } else {
        setError(msg || 'Transaction failed. Please try again.');
      }
      setStep('form');
    }
  };

  const confirmDetails = fields.map((f) => ({
    label: f.label,
    value: formData[f.key] || '',
  }));

  if (step === 'processing') {
    return (
      <div className="app-container">
        <AppHeader title={title} showBack />
        <ProcessingScreen message={`Processing your ${title.toLowerCase()}...`} />
      </div>
    );
  }

  if (step === 'slip' && completedTx) {
    return (
      <div className="app-container">
        <AppHeader
          title="Transaction Slip"
          showBack
          onBack={() => navigate({ to: '/home' })}
        />
        <div className="px-4 py-5">
          <TransactionSlip
            transaction={completedTx}
            onClose={() => navigate({ to: '/home' })}
          />
        </div>
      </div>
    );
  }

  return (
    <Layout showBottomNav={false}>
      <AppHeader title={title} showBack />
      <div className="px-4 py-5 space-y-4">
        {/* KYC Warning */}
        {kycStatus !== 'approved' && (
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
            <ShieldAlert size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 text-sm">KYC Required</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                {kycStatus === 'pending'
                  ? 'Your KYC is under review. Transactions will be enabled once approved.'
                  : 'Please complete your KYC verification before making transactions.'}
              </p>
              {kycStatus !== 'pending' && (
                <button
                  onClick={() => navigate({ to: '/kyc' })}
                  className="text-xs font-semibold text-yellow-800 underline mt-1"
                >
                  Complete KYC →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Balance Display */}
        <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
          <span className="text-xs text-gray-600">Available Balance</span>
          <span className="font-display font-bold text-primary-600">
            ৳{formatBDT(userBalance)}
          </span>
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-2xl p-4 card-shadow space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                {field.label}
              </Label>
              {field.options ? (
                <Select
                  value={formData[field.key] || ''}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, [field.key]: v }))
                  }
                >
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  className="rounded-xl h-11"
                />
              )}
            </div>
          ))}

          {/* Amount */}
          <div>
            <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Amount (BDT)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">
                ৳
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-xl h-11 pl-8"
                min="1"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold"
        >
          Continue
        </Button>
      </div>

      <ConfirmationModal
        open={step === 'confirm'}
        onClose={() => setStep('form')}
        onConfirm={handleConfirm}
        isLoading={createTx.isPending}
        title={`Confirm ${title}`}
        details={confirmDetails}
        amount={parseFloat(amount) || 0}
      />
    </Layout>
  );
}
