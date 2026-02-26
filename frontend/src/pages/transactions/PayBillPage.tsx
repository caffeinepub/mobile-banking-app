import React from 'react';
import { TransactionType } from '../../backend';
import TransactionPage from './TransactionPage';

export default function PayBillPage() {
  return (
    <TransactionPage
      title="Pay Bill"
      txType={TransactionType.payBill}
      fields={[
        {
          key: 'provider',
          label: 'Biller Name',
          placeholder: 'Select biller',
          options: [
            { value: 'DESCO', label: 'DESCO (Electricity)' },
            { value: 'DPDC', label: 'DPDC (Electricity)' },
            { value: 'TITAS', label: 'Titas Gas' },
            { value: 'WASA', label: 'WASA (Water)' },
            { value: 'BTCL', label: 'BTCL (Telephone)' },
            { value: 'Internet', label: 'Internet Bill' },
          ],
        },
        {
          key: 'recipient',
          label: 'Account / Bill Number',
          placeholder: 'Enter bill account number',
        },
      ]}
      recipientKey="recipient"
      providerKey="provider"
    />
  );
}
