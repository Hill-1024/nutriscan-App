import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Meal, AppRoute } from '../types';
import { useMealStorage } from '../hooks/useMealStorage';
import { useUserStorage } from '../hooks/useUserStorage';
import { useNavigate } from 'react-router-dom';
import { calculateDailyCalorieTarget } from '../services/nutritionService';

const MEAL_TYPE_MAP: Record<string, string> = {
    'Breakfast': '早餐',
    'Lunch': '午餐',
    'Dinner': '晚餐',
    'Snack': '加餐'
};

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { getTodayMeals, getDailyCalories, isLoaded: mealsLoaded } = useMealStorage();
    const { user, isLoaded: userLoaded } = useUserStorage();

    const [meals, setMeals] = useState<Meal[]>([]);
    const [consumed, setConsumed] = useState(0);
    const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 });
    const [greeting, setGreeting] = useState('早上好');
    const [dailyTarget, setDailyTarget] = useState(1800);

    // Update local state when hook data loads or changes
    useEffect(() => {
        if (userLoaded) {
            setDailyTarget(calculateDailyCalorieTarget(user));
        }
    }, [user, userLoaded]);

    useEffect(() => {
        if (mealsLoaded) {
            const todayMeals = getTodayMeals();
            setMeals(todayMeals);
            setConsumed(getDailyCalories());

            // Calculate total macros from real data
            const totalMacros = todayMeals.reduce((acc, meal) => {
                return {
                    protein: acc.protein + (meal.macros?.protein || 0),
                    carbs: acc.carbs + (meal.macros?.carbs || 0),
                    fat: acc.fat + (meal.macros?.fat || 0)
                };
            }, { protein: 0, carbs: 0, fat: 0 });
            setMacros(totalMacros);
        }
    }, [mealsLoaded, getTodayMeals, getDailyCalories]);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 5) setGreeting('晚上好');
        else if (hour < 11) setGreeting('早上好');
        else if (hour < 13) setGreeting('中午好');
        else if (hour < 18) setGreeting('下午好');
        else setGreeting('晚上好');
    }, []);

    const remaining = Math.max(0, dailyTarget - consumed);
    const data = [
        { name: '已摄入', value: consumed },
        { name: '剩余', value: remaining },
    ];

    if (!mealsLoaded || !userLoaded) {
        return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>;
    }

    // Recommended Macro Ratios (Standard Balanced Diet)
    // Protein: 20-30%, Fat: 25-35%, Carbs: 45-65%
    // Using simplified: P: 25%, F: 30%, C: 45%
    // 1g Protein = 4kcal, 1g Carb = 4kcal, 1g Fat = 9kcal
    const targetProtein = Math.round((dailyTarget * 0.25) / 4);
    const targetCarbs = Math.round((dailyTarget * 0.45) / 4);
    const targetFat = Math.round((dailyTarget * 0.30) / 9);

    return (
        <div className="flex flex-col min-h-screen pb-32">
            {/* Top Bar */}
            <div className="sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 py-3 flex items-center justify-between border-b border-transparent dark:border-gray-800 transition-colors">
                <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                        {new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'numeric', day: 'numeric' })}
                    </p>
                    <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-[#141613] dark:text-white">{greeting}, {user.name}</h2>
                </div>
            </div>

            <main className="flex flex-col px-4 gap-6 mt-4">
                {/* Ring Chart */}
                <div className="flex flex-col items-center justify-center py-2 relative">
                    <div className="relative w-72 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={110}
                                    outerRadius={125}
                                    startAngle={180}
                                    endAngle={-180}
                                    paddingAngle={0}
                                    dataKey="value"
                                    stroke="none"
                                    cornerRadius={10}
                                >
                                    {/* Background Track Simulation (approximate) */}
                                    <Cell key="track" fill="#71ac53" />
                                    <Cell key="remaining" fill="#F9E795" opacity={0.3} />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                <span className="material-symbols-outlined text-primary" style={{fontSize: '20px'}}>local_fire_department</span>
                            </div>
                            <h1 className="text-[40px] font-bold text-[#141613] dark:text-white tracking-tight leading-none">{remaining.toLocaleString()}</h1>
                            <p className="text-base font-medium text-[#737e6d] dark:text-gray-400 mt-1">剩余 / {dailyTarget}</p>
                        </div>
                    </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-3">
                    <MacroCard name="蛋白质" value={Math.round(macros.protein)} total={targetProtein} color="bg-primary" />
                    <MacroCard name="碳水" value={Math.round(macros.carbs)} total={targetCarbs} color="bg-secondary" isLight />
                    <MacroCard name="脂肪" value={Math.round(macros.fat)} total={targetFat} color="bg-[#E5B68D]" />
                </div>

                {/* Meal Log Header */}
                <div className="flex items-end justify-between pt-4 pb-1">
                    <h3 className="text-xl font-bold text-[#141613] dark:text-white tracking-tight">今日饮食</h3>
                    <button
                        onClick={() => navigate(AppRoute.HISTORY)}
                        className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wide"
                    >
                        查看全部
                    </button>
                </div>

                {/* Meal Log */}
                <div className="flex flex-col gap-4">
                    {meals.length > 0 ? (
                        meals.map(meal => (
                            <div key={meal.id} className="flex items-center p-3.5 bg-white dark:bg-gray-800 rounded-2xl shadow-[0px_4px_20px_rgba(113,172,83,0.1)] hover:shadow-md transition-shadow duration-300 border border-gray-50 dark:border-gray-700">
                                <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                    <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url('${meal.image}')`}}></div>
                                </div>
                                <div className="ml-4 flex-1 py-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-[#141613] dark:text-white text-base leading-snug">{meal.name}</h4>
                                        <span className="text-[10px] font-bold text-[#737e6d] uppercase tracking-wide bg-surface-light dark:bg-gray-700 px-2 py-1 rounded-md">{MEAL_TYPE_MAP[meal.type] || meal.type}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-[#737e6d] dark:text-gray-400">
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {meal.time}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span className="font-medium text-primary">{meal.calories} kcal</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center bg-surface-light dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-400 font-medium">今天还没有记录饮食。</p>
                        </div>
                    )}

                    {/* Add Dinner Placeholder */}
                    <button
                        onClick={() => navigate(AppRoute.CAMERA)}
                        className="group flex items-center p-3 bg-surface-light dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/60 transition-colors w-full"
                    >
                        <div className="h-[72px] w-[72px] shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 text-primary shadow-sm">
                            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">add_a_photo</span>
                        </div>
                        <div className="ml-4 flex-1 text-left py-1">
                            <h4 className="font-bold text-[#141613] dark:text-white text-base group-hover:text-primary transition-colors">记录下一餐</h4>
                            <p className="text-sm text-[#737e6d] dark:text-gray-400 mt-1">拍照分析</p>
                        </div>
                        <div className="pr-3 text-gray-300 group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">arrow_forward_ios</span>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
};

const MacroCard: React.FC<{name: string, value: number, total: number, color: string, isLight?: boolean}> = ({name, value, total, color, isLight}) => (
    <div className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border border-transparent shadow-[0px_2px_8px_rgba(0,0,0,0.04)] ${isLight ? 'bg-secondary/10 dark:bg-gray-800 border-secondary/20' : 'bg-surface-light dark:bg-gray-800'}`}>
        <div className={`w-1.5 h-1.5 rounded-full mb-0.5 ${color}`}></div>
        <p className="text-[11px] font-bold text-[#737e6d] dark:text-gray-400 uppercase tracking-widest">{name}</p>
        <div className="flex flex-col items-center leading-none">
            <span className="text-lg font-bold text-[#141613] dark:text-white">{value}g</span>
            <span className="text-[10px] font-medium text-[#737e6d] mt-1">/ {total}g</span>
        </div>
    </div>
);