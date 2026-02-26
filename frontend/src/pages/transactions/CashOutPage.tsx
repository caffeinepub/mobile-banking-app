import React from 'react';
import { TransactionType } from '../../backend';
import TransactionPage from './TransactionPage';

export default function CashOutPage() {
  return (
    <TransactionPage
      title="Cash Out"
      txType={TransactionType.cashOut}
      fields={[
        {
          key: 'provider',
          label: 'Provider',
          placeholder: 'Select provider',
          options: [
            { value: 'bKash', label: 'bKash' },
            { value: 'Nagad', label: 'Nagad' },
            { value: 'Rocket', label: 'Rocket' },
            { value: 'Upay', label: 'Upay' },
          ],
        },
        {
          key: 'recipient',
          label: 'Account Number',
          placeholder: '01XXXXXXXXX',
          type: 'tel',
        },
      ]}
      recipientKey="recipient"
      providerKey="provider"
    />
  );
}
