import React, { useState } from 'react';

export interface NutritionData {
    name: string;
    calories: number;
    macros: {
        protein: number;
        carbs: number;
        fat: number;
    };
}

interface EditMealModalProps {
    initialData: NutritionData;
    onClose: () => void;
    onSave: (data: NutritionData) => void;
}

export const EditMealModal: React.FC<EditMealModalProps> = ({ initialData, onClose, onSave }) => {
    const [name, setName] = useState(initialData.name);
    const [calories, setCalories] = useState(initialData.calories.toString());
    const [protein, setProtein] = useState((initialData.macros?.protein || 0).toString());
    const [carbs, setCarbs] = useState((initialData.macros?.carbs || 0).toString());
    const [fat, setFat] = useState((initialData.macros?.fat || 0).toString());

    const handleSave = () => {
        onSave({
            name,
            calories: parseFloat(calories) || 0,
            macros: {
                protein: parseFloat(protein) || 0,
                carbs: parseFloat(carbs) || 0,
                fat: parseFloat(fat) || 0
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-[#1a1d21] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">编辑营养信息</h3>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">食物名称</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-semibold"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">卡路里 (kcal)</label>
                        <input
                            type="number"
                            value={calories}
                            onChange={e => setCalories(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-lg"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">蛋白质 (g)</label>
                            <input
                                type="number"
                                value={protein}
                                onChange={e => setProtein(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none text-center font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">碳水 (g)</label>
                            <input
                                type="number"
                                value={carbs}
                                onChange={e => setCarbs(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none text-center font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">脂肪 (g)</label>
                            <input
                                type="number"
                                value={fat}
                                onChange={e => setFat(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none text-center font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-2 bg-gray-50/50 dark:bg-black/20 pb-safe">
                    <button
                        onClick={handleSave}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-transform active:scale-[0.98]"
                    >
                        保存修改
                    </button>
                </div>
            </div>
        </div>
    );
};