import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatBDT } from '../utils/validation';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title: string;
  details: { label: string; value: string }[];
  amount: number;
}

export default function ConfirmationModal({
  open, onClose, onConfirm, isLoading, title, details, amount
}: ConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[380px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertTriangle size={16} className="text-yellow-600" />
            </div>
            <DialogTitle className="text-base">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Please review the details before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {details.map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-50">
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-xs font-semibold text-gray-800">{value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-2 bg-primary-50 rounded-xl px-3 mt-2">
            <span className="text-sm font-semibold text-gray-700">Total Amount</span>
            <span className="text-lg font-display font-bold text-primary-500">৳{formatBDT(amount)}</span>
          </div>
        </div>

        <DialogFooter className="flex gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
