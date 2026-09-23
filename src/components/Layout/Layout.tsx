import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { LocationInfo } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  activeLocation: string;
  onLocationChange: (loc: string, info?: LocationInfo) => void;
  onRequestGPSLocation?: () => void;
  onSearchSubmit?: (query: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeView,
  setActiveView,
  activeLocation,
  onLocationChange,
  onRequestGPSLocation,
  onSearchSubmit
}) => {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content-wrapper">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          activeLocation={activeLocation}
          onLocationChange={onLocationChange}
          onRequestGPSLocation={onRequestGPSLocation}
          onSearchSubmit={onSearchSubmit}
        />

        <main className="content-inner animate-fade">{children}</main>
      </div>
    </div>
  );
};
