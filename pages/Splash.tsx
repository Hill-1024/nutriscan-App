import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';

export const Splash: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Simulate initial loading or auth check
        const timer = setTimeout(() => {
            navigate(AppRoute.DASHBOARD);
        }, 2800); // Slightly increased duration to enjoy the animation
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden font-display selection:bg-primary/20">
            {/* Ambient Background Effect - Adjusted for new palette */}
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#71ac53] rounded-full blur-[120px] opacity-20 dark:opacity-10 pointer-events-none z-0 animate-pulse-slow"></div>
            <div className="absolute bottom-[20%] right-[-10%] w-[300px] h-[300px] bg-[#F9E795] rounded-full blur-[100px] opacity-30 dark:opacity-5 pointer-events-none z-0"></div>

            <div className="relative z-10 flex flex-col items-center justify-between h-full w-full px-6 py-8">
                <div className="flex-1"></div>

                {/* Central Brand Area */}
                <div className="flex flex-col items-center justify-center flex-[2]">
                    <div className="relative group cursor-default">
                        {/* Glow Ring */}
                        <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] scale-105 blur-2xl opacity-0 animate-[fade-in_1s_ease-out_forwards]"></div>

                        {/* Logo Container */}
                        <div className="w-36 h-36 md:w-44 md:h-44 relative flex items-center justify-center bg-gradient-to-br  rounded-[2.5rem]">

                            {/* Internal Icon SVG */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path fill="#65a30d" d="M3 3a1 1 0 0 0-1 1v5.5c0 1.69 1.03 3.13 2.5 3.72v6.28A1.5 1.5 0 0 0 6 21a1.5 1.5 0 0 0 1.5-1.5v-6.28c1.47-.59 2.5-2.03 2.5-3.72V4a1 1 0 0 0-1-1a1 1 0 0 0-1 1v4a.5.5 0 0 1-.5.5A.5.5 0 0 1 7 8V4a1 1 0 0 0-1-1a1 1 0 0 0-1 1v4a.5.5 0 0 1-.5.5A.5.5 0 0 1 4 8V4a1 1 0 0 0-1-1m16.88 0c-.13 0-.26.09-.38.16L16 5.25V9h-4v2h1l1 10h6l1-10h1V9h-4V6.34l2.5-1.5c.5-.28.63-.84.34-1.34c-.21-.36-.58-.55-.96-.5"/></svg>

                            {/* Shine Effect */}
                            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#141613] tracking-tight dark:text-white mb-2">
                            Nutri<span className="text-primary">Scan</span>
                        </h1>
                        <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 tracking-[0.2em] uppercase">
                            AI 智能饮食追踪
                        </p>
                    </div>
                </div>

                {/* Footer Area */}
                <div className="flex flex-col items-center justify-end flex-1 w-full pb-8 md:pb-12 space-y-8">

                    {/* Loading Indicator */}
                    <div className="flex items-center gap-2 mt-4 opacity-80">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-[bounce_1.4s_infinite_ease-in-out]"></div>
                        <div className="w-2.5 h-2.5 bg-primary/70 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_0.2s]"></div>
                        <div className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_0.4s]"></div>
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] text-gray-300 dark:text-gray-700 font-mono tracking-widest">v{process.env.APP_VERSION} • BY CAPACITOR</p>
                    </div>
                </div>
            </div>
        </div>
    );
};