import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Meal } from '../types';
import { useMealStorage } from '../hooks/useMealStorage';
import { EditMealModal, NutritionData } from '../components/EditMealModal';

const MEAL_TYPE_MAP: Record<string, string> = {
    'Breakfast': '早餐',
    'Lunch': '午餐',
    'Dinner': '晚餐',
    'Snack': '加餐'
};

export const History: React.FC = () => {
    const navigate = useNavigate();
    const { meals, isLoaded, removeMeal, updateMeal } = useMealStorage();
    const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

    // Group by date locally in the component
    const history = React.useMemo(() => {
        return meals.reduce((acc, meal) => {
            if (!acc[meal.date]) {
                acc[meal.date] = [];
            }
            acc[meal.date].push(meal);
            return acc;
        }, {} as Record<string, Meal[]>);
    }, [meals]);

    // Sort dates descending
    const sortedDates = Object.keys(history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const getRelativeDate = (dateStr: string) => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (dateStr === today) return '今天';
        if (dateStr === yesterday) return '昨天';
        return new Date(dateStr).toLocaleDateString('zh-CN', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('确认删除这条饮食记录吗？')) {
            await removeMeal(id);
        }
    };

    const handleEditSave = async (data: NutritionData) => {
        if (editingMeal) {
            const updatedMeal: Meal = {
                ...editingMeal,
                name: data.name,
                calories: data.calories,
                macros: data.macros
            };
            await updateMeal(updatedMeal);
            setEditingMeal(null);
        }
    };

    if (!isLoaded) {
        return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>;
    }

    return (
        <div className="flex flex-col min-h-screen pb-32 bg-background-light dark:bg-background-dark font-display text-[#141613] dark:text-white">
            {/* Edit Modal */}
            {editingMeal && (
                <EditMealModal
                    initialData={{
                        name: editingMeal.name,
                        calories: editingMeal.calories,
                        macros: editingMeal.macros || { protein: 0, carbs: 0, fat: 0 }
                    }}
                    onClose={() => setEditingMeal(null)}
                    onSave={handleEditSave}
                />
            )}

            {/* Header */}
            <div className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-xl px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">历史记录</h2>
            </div>

            <div className="flex flex-col px-4 pt-4 gap-6">
                {sortedDates.length > 0 ? (
                    sortedDates.map(date => (
                        <div key={date} className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 px-2">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{getRelativeDate(date)}</h3>
                                <div className="h-[1px] flex-1 bg-gray-100 dark:bg-gray-800"></div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {history[date].sort((a,b) => b.timestamp - a.timestamp).map(meal => (
                                    <div
                                        key={meal.id}
                                        onClick={() => setEditingMeal(meal)}
                                        className="group relative flex items-center p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
                                    >
                                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url('${meal.image}')`}}></div>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-[#141613] dark:text-white text-sm">{meal.name}</h4>
                                                <span className="text-[10px] font-bold text-[#737e6d] bg-surface-light dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{meal.calories} kcal</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-gray-400 font-medium">{MEAL_TYPE_MAP[meal.type] || meal.type} • {meal.time}</span>
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => handleDelete(e, meal.id)}
                                            className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="mt-12 flex flex-col items-center justify-center text-center opacity-50">
                        <span className="material-symbols-outlined text-4xl mb-2">history_toggle_off</span>
                        <p>暂无饮食记录</p>
                    </div>
                )}
            </div>
        </div>
    );
};