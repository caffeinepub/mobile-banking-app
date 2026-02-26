import React from 'react';
import { TransactionType } from '../../backend';
import TransactionPage from './TransactionPage';

export default function SendMoneyPage() {
  return (
    <TransactionPage
      title="Send Money"
      txType={TransactionType.sendMoney}
      fields={[
        {
          key: 'recipient',
          label: 'Recipient Mobile Number',
          placeholder: '01XXXXXXXXX',
          type: 'tel',
        },
      ]}
      recipientKey="recipient"
      providerKey="recipient"
    />
  );
}
