import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';

export const Splash: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Simulate initial loading or auth check
        const timer = setTimeout(() => {
            navigate(AppRoute.DASHBOARD);
        }, 2500);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden font-display">
            {/* Ambient Background Effect */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#F9E795] rounded-full blur-[100px] opacity-40 dark:opacity-5 pointer-events-none z-0"></div>

            <div className="relative z-10 flex flex-col items-center justify-between h-full w-full px-6 py-8">
                <div className="flex-1"></div>

                {/* Central Brand Area */}
                <div className="flex flex-col items-center justify-center flex-[2] animate-float">
                    <div className="relative group cursor-default">
                        <div className="absolute inset-0 bg-primary/10 rounded-full scale-110 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <div className="w-32 h-32 md:w-40 md:h-40 relative flex items-center justify-center bg-white dark:bg-background-dark/50 rounded-3xl shadow-[0_20px_60px_-15px_rgba(113,172,83,0.15)] dark:shadow-none border border-transparent dark:border-white/5 backdrop-blur-sm">
                            <div
                                className="w-20 h-20 md:w-24 md:h-24 bg-contain bg-center bg-no-repeat"
                                style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCDQ0PHd9KPDH1jRVuQuQf-jgPZxv65jpmfY1jJxHsjGrmh71u6I1Xr8ahEwUEHVAJAHiifdb7ZWPm6_GhHzhQaIX5TTfYK1nlwtWAmKtZTcPVhqTNBtLuzrp1n1on1J3o83BAynx3KfwbjO0ugZ6BsSct-SLNUlA_dx9BJUqif58JZxlzKfbUcF82ZSxT3hXawKWlFR00lv1AdZJagUo80uwaNBGw6zAOgjzyP2zlmg98P0-UXgBhsNpLAi1FgNJch1UsY3u_w5Q")'}}
                            ></div>

                            <div className="absolute -right-3 -bottom-3 bg-primary/20 p-2 rounded-full backdrop-blur-md border border-white/20">
                                <span className="material-symbols-outlined text-primary text-xl">restaurant</span>
                            </div>
                        </div>
                    </div>

                    <h1 className="mt-8 text-4xl md:text-5xl font-bold text-primary tracking-tight dark:text-white">
                        Nutri<span className="text-[#333333] dark:text-gray-300 font-light">Scan</span>
                    </h1>
                </div>

                {/* Footer Area */}
                <div className="flex flex-col items-center justify-end flex-1 w-full pb-8 md:pb-12 space-y-6">
                    <div className="flex flex-col items-center space-y-3">
                        <h2 className="text-[#333333] dark:text-gray-200 tracking-wide text-xl md:text-2xl font-medium leading-tight text-center">
                            轻食生活，焕发光彩
                        </h2>
                        <div className="h-1.5 w-1.5 bg-primary rounded-full opacity-50"></div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 opacity-60">
                        <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1.4s_infinite_ease-in-out]"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1.4s_infinite_ease-in-out_0.2s]"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1.4s_infinite_ease-in-out_0.4s]"></div>
                    </div>

                    <p className="text-xs text-gray-400 dark:text-gray-600 font-medium tracking-widest uppercase mt-4">v{process.env.APP_VERSION}</p>
                </div>
            </div>
        </div>
    );
};