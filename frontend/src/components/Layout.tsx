import React from 'react';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

export default function Layout({ children, showBottomNav = true }: LayoutProps) {
  return (
    <div className="app-container">
      <div className={showBottomNav ? 'page-content' : ''}>
        {children}
      </div>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
