import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingScreenProps {
  message?: string;
}

export default function ProcessingScreen({ message = 'Processing your transaction...' }: ProcessingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 rounded-full green-gradient flex items-center justify-center mb-6 card-shadow-md">
        <Loader2 size={36} className="text-white animate-spin" />
      </div>
      <h3 className="font-display font-bold text-xl text-gray-900 mb-2">Processing</h3>
      <p className="text-gray-500 text-sm text-center">{message}</p>
      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary-500 pulse-green"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    </div>
  );
}
