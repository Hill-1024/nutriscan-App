import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { useMealStorage } from '../hooks/useMealStorage';

export const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { clearAllMeals } = useMealStorage();

    const handleClearData = async () => {
        if (confirm('确定要清除所有饮食记录吗？此操作无法撤销。')) {
            await clearAllMeals();
            alert('数据已清除。');
            navigate(AppRoute.DASHBOARD);
            window.location.reload(); // Reload to reset state fully
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-[#141613] dark:text-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-xl px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-xl font-bold tracking-tight">设置</h2>
            </div>

            <div className="flex flex-col px-6 pt-6 gap-8">

                {/* Data Management */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500">database</span>
                        <h3 className="text-lg font-bold">数据管理</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        您的所有饮食记录都保存在本地设备上。
                    </p>
                    <button
                        onClick={handleClearData}
                        className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl group active:bg-red-100 transition-colors"
                    >
                        <span className="text-red-600 dark:text-red-400 font-semibold text-sm">清除所有记录</span>
                        <span className="material-symbols-outlined text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">delete_forever</span>
                    </button>
                </section>

                <div className="mt-auto pt-8 pb-12 text-center">
                    <p className="text-xs text-gray-400">NutriScan Local v{process.env.APP_VERSION}</p>
                    <p className="text-[10px] text-gray-300 mt-1">在 Android WebView 上本地运行</p>
                </div>

            </div>
        </div>
    );
};