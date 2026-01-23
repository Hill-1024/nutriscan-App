import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoute } from '../types';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Don't show nav on Camera, Splash, or Result pages to match pure immersive design
  if (location.pathname === AppRoute.CAMERA || location.pathname === AppRoute.SPLASH || location.pathname === AppRoute.RESULT) {
    return null;
  }

  const NavItem = ({ path, icon, label }: { path: string; icon: string; label: string }) => {
    const active = isActive(path);
    return (
        <button
            onClick={() => navigate(path)}
            className="group relative flex flex-col items-center justify-center h-full w-full gap-1 active:scale-95 transition-transform duration-200"
        >
          <div className={`relative flex items-center justify-center p-1 rounded-xl transition-all duration-300 ${active ? '-translate-y-1' : 'group-hover:bg-gray-50 dark:group-hover:bg-white/5'}`}>
          <span className={`material-symbols-outlined text-[26px] transition-colors duration-300 ${active ? 'text-primary icon-filled' : 'text-[#A5AD9F] dark:text-gray-500 group-hover:text-primary/70'}`}>
            {icon}
          </span>
            {/* Active Dot Indicator */}
            <div className={`absolute -bottom-2 w-1 h-1 rounded-full bg-primary transition-all duration-300 ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
          </div>
          <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${active ? 'text-primary' : 'text-[#A5AD9F] dark:text-gray-500'}`}>
          {label}
        </span>
        </button>
    );
  };

  return (
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="relative h-[88px] bg-white/95 dark:bg-[#1a1d21]/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">

          {/* 5-Column Grid Layout for Perfect Symmetry */}
          <div className="grid grid-cols-5 h-full px-2">

            {/* Left Group */}
            <div className="flex items-start pt-3">
              <NavItem path={AppRoute.DASHBOARD} icon="home" label="首页" />
            </div>
            <div className="flex items-start pt-3">
              <NavItem path={AppRoute.HISTORY} icon="calendar_month" label="历史" />
            </div>

            {/* Center Spacer for FAB */}
            <div className="pointer-events-none"></div>

            {/* Right Group */}
            <div className="flex items-start pt-3">
              <NavItem path={AppRoute.SETTINGS} icon="settings" label="设置" />
            </div>
            <div className="flex items-start pt-3">
              <NavItem path={AppRoute.PROFILE} icon="person" label="我的" />
            </div>

          </div>

          {/* Floating Action Button (FAB) - Perfectly Centered */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <button
                onClick={() => navigate(AppRoute.CAMERA)}
                className="group relative bg-primary hover:bg-[#5d9444] text-white rounded-full w-[72px] h-[72px] flex items-center justify-center shadow-[0_8px_24px_rgba(113,172,83,0.4)] transition-all active:scale-95 border-[6px] border-white dark:border-[#22262a]"
            >
              <div className="absolute inset-0 rounded-full border border-white/20"></div>
              <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">photo_camera</span>
            </button>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#A5AD9F] dark:text-gray-500 tracking-wide pointer-events-none">
                识别
            </span>
          </div>
        </div>

        {/* iOS Home Indicator Spacer / Android Gesture Bar */}
        <div className="h-6 bg-white dark:bg-[#1a1d21] pb-safe"></div>
      </div>
  );
};