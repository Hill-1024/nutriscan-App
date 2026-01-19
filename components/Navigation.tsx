import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoute } from '../types';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Don't show nav on Camera, Splash, or Result pages to match pure immersive design of those screens
  if (location.pathname === AppRoute.CAMERA || location.pathname === AppRoute.SPLASH || location.pathname === AppRoute.RESULT) {
    return null;
  }

  return (
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="relative h-[88px] bg-white/95 dark:bg-[#1a1d21]/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] flex justify-between items-start px-8 pt-4 pb-6">

          {/* Left Group */}
          <div className="flex gap-10">
            <button
                onClick={() => navigate(AppRoute.DASHBOARD)}
                className={`flex flex-col items-center gap-1.5 transition-colors ${isActive(AppRoute.DASHBOARD) ? 'text-primary' : 'text-[#A5AD9F] hover:text-primary'}`}
            >
              <span className={`material-symbols-outlined text-[26px] ${isActive(AppRoute.DASHBOARD) ? 'icon-filled' : ''}`}>home</span>
              <span className="text-[10px] font-bold tracking-wide">首页</span>
            </button>

            <button
                onClick={() => navigate(AppRoute.HISTORY)}
                className={`flex flex-col items-center gap-1.5 transition-colors ${isActive(AppRoute.HISTORY) ? 'text-primary' : 'text-[#A5AD9F] hover:text-primary'}`}
            >
              <span className={`material-symbols-outlined text-[26px] ${isActive(AppRoute.HISTORY) ? 'icon-filled' : ''}`}>calendar_month</span>
              <span className="text-[10px] font-bold tracking-wide">历史</span>
            </button>
          </div>

          {/* FAB Spacer */}
          <div className="w-14"></div>

          {/* Right Group */}
          <div className="flex gap-10">
            <button
                onClick={() => navigate(AppRoute.PROFILE)}
                className={`flex flex-col items-center gap-1.5 transition-colors ${isActive(AppRoute.PROFILE) ? 'text-primary' : 'text-[#A5AD9F] hover:text-primary'}`}
            >
              <span className={`material-symbols-outlined text-[26px] ${isActive(AppRoute.PROFILE) ? 'icon-filled' : ''}`}>person</span>
              <span className="text-[10px] font-bold tracking-wide">我的</span>
            </button>
          </div>

          {/* FAB */}
          <button
              onClick={() => navigate(AppRoute.CAMERA)}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary hover:bg-[#5d9444] text-white rounded-full w-[72px] h-[72px] flex items-center justify-center shadow-[0_8px_24px_rgba(113,172,83,0.4)] transition-all active:scale-95 border-[6px] border-white dark:border-[#22262a]"
          >
            <span className="material-symbols-outlined text-[32px]">photo_camera</span>
          </button>
        </div>

        {/* iOS Home Indicator Spacer / Android Gesture Bar */}
        <div className="h-6 bg-white dark:bg-[#1a1d21] pb-safe"></div>
      </div>
  );
};