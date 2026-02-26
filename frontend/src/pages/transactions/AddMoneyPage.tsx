import React from 'react';
import { TransactionType } from '../../backend';
import TransactionPage from './TransactionPage';

export default function AddMoneyPage() {
  return (
    <TransactionPage
      title="Add Money"
      txType={TransactionType.addMoney}
      fields={[
        {
          key: 'provider',
          label: 'Source',
          placeholder: 'Select source',
          options: [
            { value: 'bKash', label: 'bKash' },
            { value: 'Nagad', label: 'Nagad' },
            { value: 'Rocket', label: 'Rocket' },
            { value: 'Upay', label: 'Upay' },
            { value: 'Bank', label: 'Bank Transfer' },
          ],
        },
        {
          key: 'recipient',
          label: 'Account / Reference Number',
          placeholder: 'Enter account number',
        },
      ]}
      recipientKey="recipient"
      providerKey="provider"
    />
  );
}
