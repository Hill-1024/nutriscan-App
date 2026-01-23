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
        <div className="flex flex-col min-h-screen pb-32 bg-background-light dark:bg-background-dark font-display text-[#141613] dark:text-white">
            {/* Header - No Back Button (Top Level Tab) */}
            <div className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-xl px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">设置</h2>
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

                {/* About App */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-500">info</span>
                        <h3 className="text-lg font-bold">关于应用</h3>
                    </div>
                    <div className="p-4 bg-surface-light dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-sm">当前版本</span>
                            <span className="text-sm text-gray-500">v{process.env.APP_VERSION}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm">构建环境</span>
                            <span className="text-sm text-gray-500">Capacitor / Android</span>
                        </div>
                    </div>
                </section>

                <div className="mt-auto pt-8 pb-4 text-center">
                    <p className="text-[10px] text-gray-300">NutriScan Local • AI Powered</p>
                </div>

            </div>
        </div>
    );
};