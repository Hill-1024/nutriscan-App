import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ScannedFood, AppRoute, Meal } from '../types';
import { useMealStorage } from '../hooks/useMealStorage';
import { inferMealType } from '../services/mealService';
import { EditMealModal, NutritionData } from '../components/EditMealModal';

const CONFIDENCE_MAP: Record<string, string> = {
    'High': '高',
    'Medium': '中',
    'Low': '低'
};

export const ScanResult: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addMeal } = useMealStorage();

    const [foodData, setFoodData] = useState<ScannedFood | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (location.state?.result) {
            setFoodData(location.state.result);
        }
    }, [location.state]);

    if (!foodData) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark text-[#141613] dark:text-white">
                <div className="text-center">
                    <p className="mb-4">未找到扫描数据。</p>
                    <button onClick={() => navigate(AppRoute.DASHBOARD)} className="text-primary font-bold underline">返回首页</button>
                </div>
            </div>
        );
    }

    const handleAddToDiary = async () => {
        setIsSaving(true);
        const now = new Date();

        // Construct local YYYY-MM-DD
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const localDateStr = `${year}-${month}-${day}`;

        const macros = foodData.macros || { protein: 0, carbs: 0, fat: 0 };

        const newMeal: Meal = {
            id: Date.now().toString(),
            name: foodData.name || '未知食物',
            calories: Number(foodData.calories) || 0,
            image: foodData.image,
            date: localDateStr,
            timestamp: now.getTime(),
            time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
            type: inferMealType(now.getHours()),
            macros: macros
        };

        await addMeal(newMeal);
        setIsSaving(false);
        navigate(AppRoute.DASHBOARD);
    };

    const handleUpdateFood = (updated: NutritionData) => {
        if (foodData) {
            setFoodData({
                ...foodData,
                name: updated.name,
                calories: updated.calories,
                macros: updated.macros
            });
        }
        setIsEditing(false);
    };

    const macros = foodData.macros || { protein: 0, carbs: 0, fat: 0 };
    const chartData = [
        { name: '蛋白质', value: macros.protein || 0 },
        { name: '碳水', value: macros.carbs || 0 },
        { name: '脂肪', value: macros.fat || 0 },
    ];

    const COLORS = ['#71ac53', '#F9E795', '#d1d5db'];

    return (
        <div className="relative mx-auto flex h-full min-h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100">

            {isEditing && foodData && (
                <EditMealModal
                    initialData={{
                        name: foodData.name,
                        calories: foodData.calories,
                        macros: foodData.macros
                    }}
                    onClose={() => setIsEditing(false)}
                    onSave={handleUpdateFood}
                />
            )}

            {/* Top App Bar */}
            <header className="flex items-center justify-between p-6 pb-2 relative z-10">
                <button onClick={() => navigate(AppRoute.DASHBOARD)} className="group flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-900 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-white">
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">扫描结果</h2>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 pt-4 pb-40 no-scrollbar">
                {/* Result Image Card */}
                <div className="relative mb-8 w-full overflow-hidden rounded-2xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] group">
                    <div className="aspect-[4/3] w-full bg-gray-100 dark:bg-gray-800 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                         style={{backgroundImage: `url('${foodData.image}')`}}>
                    </div>

                    {/* Status Badges */}
                    <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                        <div className="self-start flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-md dark:bg-black/60 shadow-sm">
                            <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">置信度: {CONFIDENCE_MAP[foodData.confidence] || foodData.confidence || '中'}</span>
                        </div>

                        {/* Source Model Badge */}
                        {foodData.sourceModel && (
                            <div className="self-start flex items-center gap-1.5 rounded-full bg-blue-50/90 px-3 py-1.5 backdrop-blur-md dark:bg-blue-900/60 shadow-sm">
                                <span className="material-symbols-outlined text-[16px] text-blue-500">smart_toy</span>
                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-200">{foodData.sourceModel}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Title & Calorie */}
                <div className="mb-8 flex flex-col items-center text-center">
                    <h1 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white capitalize">{foodData.name || '识别食物'}</h1>
                    <p className="mb-6 text-sm font-medium text-gray-500 dark:text-gray-400">扫描 • 今天 {new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit', hour12: false})}</p>
                    <div className="relative flex flex-col items-center justify-center">
                        <span className="text-[56px] font-extrabold leading-none tracking-tight text-primary">{foodData.calories}</span>
                        <span className="text-lg font-semibold text-primary/80">kcal</span>
                    </div>
                </div>

                {/* Macro Donut */}
                <div className="mb-8 rounded-2xl bg-white p-6 shadow-[0_4px_20px_-2px_rgba(113,172,83,0.1)] dark:bg-gray-800">
                    <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-around">
                        <div className="relative flex h-32 w-32 items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={58}
                                        paddingAngle={5}
                                        dataKey="value"
                                        cornerRadius={4}
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400 text-3xl">pie_chart</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex w-full flex-col gap-3 sm:w-auto">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-secondary shadow-sm"></div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">碳水</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{macros.carbs}g</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-primary shadow-sm"></div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">蛋白质</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{macros.protein}g</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-500 shadow-sm"></div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">脂肪</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{macros.fat}g</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Extra Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">份量</p>
                        <p className="text-base font-bold text-gray-900 dark:text-white">标准</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">来源</p>
                        <p className="text-base font-bold text-gray-900 dark:text-white">{foodData.sourceModel || 'AI 分析'}</p>
                    </div>
                </div>
            </main>

            {/* Footer Actions */}
            <footer className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pb-8 pt-12 px-6 dark:from-background-dark dark:via-background-dark z-10">
                <div className="flex flex-col gap-3">
                    <button
                        disabled={isSaving}
                        onClick={handleAddToDiary}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 hover:bg-opacity-90 disabled:opacity-70"
                    >
                        {isSaving ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <span className="material-symbols-outlined fill-1">check_circle</span>
                        )}
                        {isSaving ? '保存中...' : '添加到日记'}
                    </button>

                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                        编辑营养信息
                    </button>
                </div>
            </footer>
        </div>
    );
};