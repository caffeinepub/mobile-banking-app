import React from 'react';
import { Megaphone } from 'lucide-react';

interface AnnouncementMarqueeProps {
  announcements: string[];
}

export default function AnnouncementMarquee({ announcements }: AnnouncementMarqueeProps) {
  if (!announcements.length) return null;

  const text = announcements.join('  •  ');

  return (
    <div className="bg-primary-50 border-y border-primary-100 flex items-center overflow-hidden h-9">
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 bg-primary-500 h-full">
        <Megaphone size={14} className="text-white" />
        <span className="text-white text-xs font-semibold whitespace-nowrap">Notice</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="marquee-text text-xs text-primary-700 font-medium py-2 px-2">
          {text}
        </div>
      </div>
    </div>
  );
}
