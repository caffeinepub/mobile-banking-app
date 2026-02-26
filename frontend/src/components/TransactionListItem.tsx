import React from 'react';
import { Transaction, TransactionStatus, TransactionType } from '../backend';
import { formatBDT, formatDate } from '../utils/validation';
import { Send, Smartphone, PlusCircle, Receipt, Banknote, Building2, PiggyBank, Clock, CheckCircle, XCircle } from 'lucide-react';

interface TransactionListItemProps {
  transaction: Transaction;
  onClick: () => void;
}

const txIcons: Record<string, React.ReactNode> = {
  sendMoney: <Send size={18} className="text-blue-600" />,
  recharge: <Smartphone size={18} className="text-purple-600" />,
  addMoney: <PlusCircle size={18} className="text-green-600" />,
  payBill: <Receipt size={18} className="text-orange-600" />,
  cashOut: <Banknote size={18} className="text-red-600" />,
  bankTransfer: <Building2 size={18} className="text-indigo-600" />,
  savings: <PiggyBank size={18} className="text-yellow-600" />,
};

const txIconBg: Record<string, string> = {
  sendMoney: 'bg-blue-100',
  recharge: 'bg-purple-100',
  addMoney: 'bg-green-100',
  payBill: 'bg-orange-100',
  cashOut: 'bg-red-100',
  bankTransfer: 'bg-indigo-100',
  savings: 'bg-yellow-100',
};

const txLabels: Record<string, string> = {
  sendMoney: 'Send Money',
  recharge: 'Recharge',
  addMoney: 'Add Money',
  payBill: 'Pay Bill',
  cashOut: 'Cash Out',
  bankTransfer: 'Bank Transfer',
  savings: 'Savings',
};

const isIncoming = (type: TransactionType) => type === TransactionType.addMoney;

export default function TransactionListItem({ transaction, onClick }: TransactionListItemProps) {
  const incoming = isIncoming(transaction.txType);
  const cancelled = transaction.status === TransactionStatus.cancelled;

  const statusIcon = {
    [TransactionStatus.processing]: <Clock size={12} className="text-yellow-600" />,
    [TransactionStatus.completed]: <CheckCircle size={12} className="text-green-600" />,
    [TransactionStatus.cancelled]: <XCircle size={12} className="text-red-600" />,
  }[transaction.status];

  const statusLabel = {
    [TransactionStatus.processing]: 'Processing',
    [TransactionStatus.completed]: 'Completed',
    [TransactionStatus.cancelled]: 'Cancelled',
  }[transaction.status];

  const statusCls = {
    [TransactionStatus.processing]: 'status-processing',
    [TransactionStatus.completed]: 'status-completed',
    [TransactionStatus.cancelled]: 'status-cancelled',
  }[transaction.status];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 bg-white rounded-xl card-shadow hover:shadow-card-md active:scale-[0.99] transition-all text-left"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${txIconBg[transaction.txType] || 'bg-gray-100'}`}>
        {txIcons[transaction.txType] || <Receipt size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">{txLabels[transaction.txType] || transaction.txType}</span>
          <span className={`text-sm font-bold ${cancelled ? 'text-gray-400 line-through' : incoming ? 'text-green-600' : 'text-red-500'}`}>
            {incoming ? '+' : '-'}৳{formatBDT(transaction.amount)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-gray-400 truncate max-w-[140px]">
            {transaction.recipient || transaction.provider || 'N/A'}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCls}`}>
            {statusIcon}
            {statusLabel}
          </span>
        </div>
        <p className="text-[10px] text-gray-300 mt-0.5">{formatDate(transaction.createdAt)}</p>
      </div>
    </button>
  );
}
