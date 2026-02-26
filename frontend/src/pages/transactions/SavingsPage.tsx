import React from 'react';
import { TransactionType } from '../../backend';
import TransactionPage from './TransactionPage';

export default function SavingsPage() {
  return (
    <TransactionPage
      title="Savings"
      txType={TransactionType.savings}
      fields={[
        {
          key: 'provider',
          label: 'Savings Plan',
          placeholder: 'Select plan',
          options: [
            { value: '3 Months', label: '3 Months Plan' },
            { value: '6 Months', label: '6 Months Plan' },
            { value: '12 Months', label: '12 Months Plan' },
            { value: '24 Months', label: '24 Months Plan' },
          ],
        },
        {
          key: 'recipient',
          label: 'Purpose / Note',
          placeholder: 'e.g. Emergency fund, Education',
        },
      ]}
      recipientKey="recipient"
      providerKey="provider"
    />
  );
}
