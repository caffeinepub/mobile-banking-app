import React from 'react';
import { TransactionType } from '../../backend';
import TransactionPage from './TransactionPage';

export default function BankTransferPage() {
  return (
    <TransactionPage
      title="Bank Transfer"
      txType={TransactionType.bankTransfer}
      fields={[
        {
          key: 'provider',
          label: 'Bank Name',
          placeholder: 'Select bank',
          options: [
            { value: 'Dutch-Bangla Bank', label: 'Dutch-Bangla Bank' },
            { value: 'BRAC Bank', label: 'BRAC Bank' },
            { value: 'Islami Bank', label: 'Islami Bank' },
            { value: 'Sonali Bank', label: 'Sonali Bank' },
            { value: 'Janata Bank', label: 'Janata Bank' },
            { value: 'Eastern Bank', label: 'Eastern Bank' },
            { value: 'Prime Bank', label: 'Prime Bank' },
            { value: 'Other', label: 'Other Bank' },
          ],
        },
        {
          key: 'recipient',
          label: 'Account Number',
          placeholder: 'Enter bank account number',
        },
        {
          key: 'routing',
          label: 'Routing Number',
          placeholder: 'Enter routing number',
        },
      ]}
      recipientKey="recipient"
      providerKey="provider"
    />
  );
}
