import React from 'react';
import { TransactionType } from '../../backend';
import TransactionPage from './TransactionPage';

export default function RechargePage() {
  return (
    <TransactionPage
      title="Mobile Recharge"
      txType={TransactionType.recharge}
      fields={[
        {
          key: 'recipient',
          label: 'Mobile Number',
          placeholder: '01XXXXXXXXX',
          type: 'tel',
        },
        {
          key: 'provider',
          label: 'Operator',
          placeholder: 'Select operator',
          options: [
            { value: 'Grameenphone', label: 'Grameenphone (GP)' },
            { value: 'Robi', label: 'Robi' },
            { value: 'Banglalink', label: 'Banglalink' },
            { value: 'Teletalk', label: 'Teletalk' },
            { value: 'Airtel', label: 'Airtel' },
          ],
        },
      ]}
      recipientKey="recipient"
      providerKey="provider"
    />
  );
}
