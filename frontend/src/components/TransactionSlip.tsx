import React from 'react';
import { Transaction, TransactionStatus, TransactionType } from '../backend';
import { formatBDT, formatDate } from '../utils/validation';
import { CheckCircle, Clock, XCircle, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionSlipProps {
  transaction: Transaction;
  onClose?: () => void;
}

const txTypeLabels: Record<string, string> = {
  sendMoney: 'Send Money',
  recharge: 'Mobile Recharge',
  addMoney: 'Add Money',
  payBill: 'Pay Bill',
  cashOut: 'Cash Out',
  bankTransfer: 'Bank Transfer',
  savings: 'Savings',
};

export default function TransactionSlip({ transaction, onClose }: TransactionSlipProps) {
  const statusConfig = {
    [TransactionStatus.processing]: {
      icon: <Clock size={20} className="text-yellow-600" />,
      label: 'Processing',
      cls: 'status-processing',
    },
    [TransactionStatus.completed]: {
      icon: <CheckCircle size={20} className="text-green-600" />,
      label: 'Completed',
      cls: 'status-completed',
    },
    [TransactionStatus.cancelled]: {
      icon: <XCircle size={20} className="text-red-600" />,
      label: 'Cancelled',
      cls: 'status-cancelled',
    },
  };

  const status = statusConfig[transaction.status];

  return (
    <div className="bg-white rounded-2xl overflow-hidden card-shadow-md">
      {/* Header */}
      <div className="green-gradient p-5 text-white text-center">
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
          {status.icon}
        </div>
        <h3 className="font-display font-bold text-lg">{txTypeLabels[transaction.txType] || transaction.txType}</h3>
        <p className="text-white/80 text-sm mt-0.5">Transaction Receipt</p>
      </div>

      {/* Amount */}
      <div className="text-center py-4 border-b border-dashed border-gray-200">
        <p className="text-3xl font-display font-bold text-gray-900">৳{formatBDT(transaction.amount)}</p>
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mt-2 ${status.cls}`}>
          {status.icon}
          {status.label}
        </span>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <SlipRow label="Transaction ID" value={transaction.id.toUpperCase()} />
        <SlipRow label="Date & Time" value={formatDate(transaction.createdAt)} />
        {transaction.recipient && <SlipRow label="Recipient" value={transaction.recipient} />}
        {transaction.provider && <SlipRow label="Provider" value={transaction.provider} />}
      </div>

      {/* Actions */}
      <div className="p-4 pt-0 flex gap-3 no-print">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => window.print()}
        >
          <Printer size={16} />
          Save Slip
        </Button>
        {onClose && (
          <Button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white" onClick={onClose}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
}

function SlipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-800 text-right max-w-[60%] break-all">{value}</span>
    </div>
  );
}
