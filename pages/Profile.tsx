import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, UserProfile, Gender, ActivityLevel } from '../types';
import { useUserStorage } from '../hooks/useUserStorage';
import { useMealStorage } from '../hooks/useMealStorage';
import { calculateDailyCalorieTarget, getActivityLabel } from '../services/nutritionService';

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, updateUser, isLoaded: isUserLoaded } = useUserStorage();
    const { meals, isLoaded: isMealsLoaded } = useMealStorage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Local state for profile editing (Name & Avatar only)
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState<UserProfile | null>(null);

    // Local state for weight editing
    const [editingWeightType, setEditingWeightType] = useState<'current' | 'goal' | 'start' | null>(null);
    const [weightInputValue, setWeightInputValue] = useState('');

    // Local state for Body Data editing
    const [isEditingBodyData, setIsEditingBodyData] = useState(false);
    const [bodyDataForm, setBodyDataForm] = useState<{
        gender: Gender;
        age: string;
        height: string;
        activityLevel: ActivityLevel;
    } | null>(null);

    // Calendar State
    const [viewDate, setViewDate] = useState(new Date());

    useEffect(() => {
        if (user) {
            setEditForm(user);
        }
    }, [user]);

    // Helper to get local date string YYYY-MM-DD
    const getLocalDateStr = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // --- Streak Calculation ---
    const currentStreak = useMemo(() => {
        if (!meals || meals.length === 0) return 0;

        const loggedDates = new Set(meals.map(m => m.date));
        const today = new Date();
        const todayStr = getLocalDateStr(today);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateStr(yesterday);

        // Determine start point for streak
        let cursorDate = new Date();
        let checkStr = '';

        if (loggedDates.has(todayStr)) {
            cursorDate = today;
            checkStr = todayStr;
        } else if (loggedDates.has(yesterdayStr)) {
            cursorDate = yesterday;
            checkStr = yesterdayStr;
        } else {
            return 0; // Streak broken
        }

        let streak = 0;
        while (loggedDates.has(checkStr)) {
            streak++;
            cursorDate.setDate(cursorDate.getDate() - 1);
            checkStr = getLocalDateStr(cursorDate);
        }

        return streak;
    }, [meals]);

    // --- Calendar Logic ---
    const calendarData = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

        const days = [];
        const todayStr = getLocalDateStr(new Date());

        for (let i = 1; i <= daysInMonth; i++) {
            const currentDate = new Date(year, month, i);
            const dateStr = getLocalDateStr(currentDate);

            const hasMeals = meals.some(m => m.date === dateStr);
            const isToday = dateStr === todayStr;
            days.push({ day: i, hasMeals, isToday, dateStr });
        }
        return { days, firstDayOfWeek, monthName: viewDate.toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' }) };
    }, [viewDate, meals]);

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    if (!isUserLoaded || !isMealsLoaded || !editForm) return null;

    // --- Profile Handlers ---
    const handleProfileSave = async () => {
        if (editForm) {
            await updateUser(editForm);
            setIsEditingProfile(false);
        }
    };

    const handleProfileCancel = () => {
        setEditForm(user);
        setIsEditingProfile(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 400;
                    let w = img.width;
                    let h = img.height;
                    if (w > h) { if (w > MAX_SIZE) { h *= MAX_SIZE / w; w = MAX_SIZE; } } else { if (h > MAX_SIZE) { w *= MAX_SIZE / h; h = MAX_SIZE; } }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, w, h);
                    setEditForm(prev => prev ? { ...prev, avatar: canvas.toDataURL('image/jpeg', 0.8) } : null);
                };
                img.src = result;
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Weight Handlers ---
    const openWeightModal = (type: 'current' | 'goal' | 'start') => {
        setEditingWeightType(type);
        let val = '';
        if (type === 'current') val = user.currentWeight.toString();
        else if (type === 'goal') val = user.goalWeight.toString();
        else if (type === 'start') val = user.startWeight.toString();
        setWeightInputValue(val);
    };

    const saveWeight = async () => {
        const val = parseFloat(weightInputValue);
        if (!isNaN(val) && val > 0) {
            let field: keyof UserProfile = 'currentWeight';
            if (editingWeightType === 'goal') field = 'goalWeight';
            if (editingWeightType === 'start') field = 'startWeight';
            await updateUser({ ...user, [field]: val });
        }
        setEditingWeightType(null);
    };

    // --- Body Data Handlers ---
    const openBodyDataModal = () => {
        setBodyDataForm({
            gender: user.gender || 'female',
            age: (user.age || 25).toString(),
            height: (user.height || 165).toString(),
            activityLevel: user.activityLevel || 'light'
        });
        setIsEditingBodyData(true);
    };

    const saveBodyData = async () => {
        if (bodyDataForm) {
            const age = parseInt(bodyDataForm.age);
            const height = parseInt(bodyDataForm.height);
            if (age > 0 && height > 0) {
                await updateUser({
                    ...user,
                    gender: bodyDataForm.gender,
                    age,
                    height,
                    activityLevel: bodyDataForm.activityLevel
                });
            }
        }
        setIsEditingBodyData(false);
    };

    const totalToLose = user.startWeight - user.goalWeight;
    const lostSoFar = user.startWeight - user.currentWeight;
    const progressPercent = Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));

    const getWeightTitle = () => {
        if (editingWeightType === 'current') return '当前';
        if (editingWeightType === 'goal') return '目标';
        if (editingWeightType === 'start') return '初始';
        return '';
    };

    const tdee = calculateDailyCalorieTarget(user);

    return (
        <div className="relative flex flex-col min-h-screen pb-32 bg-background-light dark:bg-background-dark font-display text-[#141613] dark:text-white overflow-x-hidden antialiased">

            {/* Weight Edit Modal */}
            {editingWeightType && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white dark:bg-[#1a1d21] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden p-6 animate-in slide-in-from-bottom duration-300 pb-safe">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">更新{getWeightTitle()}体重</h3>
                            <button onClick={() => setEditingWeightType(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <span className="material-symbols-outlined text-gray-500">close</span>
                            </button>
                        </div>
                        <div className="relative mb-8">
                            <input
                                type="number"
                                autoFocus
                                value={weightInputValue}
                                onChange={(e) => setWeightInputValue(e.target.value)}
                                className="w-full text-5xl font-bold text-center bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none py-2 text-gray-900 dark:text-white"
                                placeholder="0.0"
                            />
                            <span className="absolute right-8 bottom-4 text-gray-400 font-medium text-lg">kg</span>
                        </div>
                        <button onClick={saveWeight} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-transform active:scale-[0.98] text-lg">更新体重</button>
                    </div>
                </div>
            )}

            {/* Body Data Edit Modal */}
            {isEditingBodyData && bodyDataForm && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-[#1a1d21] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto pb-safe">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">身体档案</h3>
                            <button onClick={() => setIsEditingBodyData(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <span className="material-symbols-outlined text-gray-500">close</span>
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Gender */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">性别</label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setBodyDataForm({...bodyDataForm, gender: 'male'})}
                                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${bodyDataForm.gender === 'male' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                                    >男</button>
                                    <button
                                        onClick={() => setBodyDataForm({...bodyDataForm, gender: 'female'})}
                                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${bodyDataForm.gender === 'female' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                                    >女</button>
                                </div>
                            </div>

                            {/* Age & Height */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">年龄 (岁)</label>
                                    <input
                                        type="number"
                                        value={bodyDataForm.age}
                                        onChange={(e) => setBodyDataForm({...bodyDataForm, age: e.target.value})}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none font-bold text-lg"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">身高 (cm)</label>
                                    <input
                                        type="number"
                                        value={bodyDataForm.height}
                                        onChange={(e) => setBodyDataForm({...bodyDataForm, height: e.target.value})}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none font-bold text-lg"
                                    />
                                </div>
                            </div>

                            {/* Activity */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">日常活动量</label>
                                <div className="flex flex-col gap-2">
                                    {(['sedentary', 'light', 'moderate', 'active', 'very_active'] as ActivityLevel[]).map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setBodyDataForm({...bodyDataForm, activityLevel: level})}
                                            className={`w-full p-3 rounded-xl text-left border transition-all flex justify-between items-center ${bodyDataForm.activityLevel === level ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'}`}
                                        >
                                            <span className={`font-medium ${bodyDataForm.activityLevel === level ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>{getActivityLabel(level)}</span>
                                            {bodyDataForm.activityLevel === level && <span className="material-symbols-outlined text-primary">check</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button onClick={saveBodyData} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-transform active:scale-[0.98] text-lg">保存</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-background-light dark:bg-background-dark sticky top-0 z-10">
                <div className="w-10"></div>
                <h2 className="text-lg font-bold leading-tight tracking-tight">个人中心</h2>
                {/* Settings button removed from here as it is now in the main nav */}
                <div className="w-10"></div>
            </header>

            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />

            {/* Profile Info */}
            <section className="flex flex-col items-center px-6 pt-2 pb-6">
                <div className="relative group cursor-pointer" onClick={() => isEditingProfile && fileInputRef.current?.click()}>
                    <div
                        className="w-28 h-28 rounded-full bg-cover bg-center border-4 border-white dark:border-background-dark shadow-soft transition-opacity hover:opacity-90"
                        style={{backgroundImage: `url("${editForm.avatar}")`}}
                    ></div>
                    {isEditingProfile && (
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-white">add_a_photo</span>
                        </div>
                    )}
                    {!isEditingProfile && (
                        <div
                            onClick={() => setIsEditingProfile(true)}
                            className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-background-dark shadow-sm cursor-pointer active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-[16px] block">edit</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 text-center w-full max-w-xs">
                    {isEditingProfile ? (
                        <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="text-2xl font-bold text-center bg-transparent border-b-2 border-primary/50 focus:border-primary focus:outline-none w-full text-[#141613] dark:text-white pb-1"
                            placeholder="输入姓名"
                        />
                    ) : (
                        <h1 className="text-2xl font-bold text-[#141613] dark:text-white">{user.name}</h1>
                    )}

                    <div className="flex items-center justify-center gap-1.5 mt-2 bg-orange-50 dark:bg-orange-900/10 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-900/20">
                        <span className="material-symbols-outlined text-orange-500 text-[18px]">local_fire_department</span>
                        <p className="text-orange-600 dark:text-orange-400 text-sm font-bold">
                            {currentStreak} 天连续记录
                        </p>
                    </div>
                </div>

                {isEditingProfile && (
                    <div className="flex gap-3 mt-4">
                        <button onClick={handleProfileCancel} className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-800 text-sm font-bold">取消</button>
                        <button onClick={handleProfileSave} className="px-6 py-2 rounded-full bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30">保存修改</button>
                    </div>
                )}
            </section>

            {/* Calendar */}
            <section className="px-4 mb-6">
                <div className="bg-surface-light dark:bg-surface-light/5 rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors active:scale-90">
                            <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">chevron_left</span>
                        </button>
                        <span className="text-base font-bold text-[#141613] dark:text-white capitalize">{calendarData.monthName}</span>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors active:scale-90">
                            <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">chevron_right</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-2">
                        {['日','一','二','三','四','五','六'].map(d => (
                            <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-2">
                        {Array.from({ length: calendarData.firstDayOfWeek }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square"></div>
                        ))}
                        {calendarData.days.map((dayObj) => (
                            <div key={dayObj.day} className="aspect-square flex flex-col items-center justify-center relative">
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all
                      ${dayObj.isToday ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold shadow-md z-10 scale-110' : ''}
                      ${!dayObj.isToday && dayObj.hasMeals ? 'bg-primary text-white font-bold shadow-sm' : ''}
                      ${!dayObj.isToday && !dayObj.hasMeals ? 'text-gray-500 font-medium hover:bg-black/5 dark:hover:bg-white/5' : ''}
                   `}>
                                    {dayObj.day}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                            <span className="text-xs text-gray-500 font-medium">健康饮食</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-black dark:bg-white rounded-full border border-gray-200 dark:border-gray-600"></div>
                            <span className="text-xs text-gray-500 font-medium">今天</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Cards */}
            <section className="px-4 mb-8">
                <div className="flex flex-col gap-4">

                    <div className="flex gap-4">
                        {/* Current Weight Card */}
                        <button
                            onClick={() => openWeightModal('current')}
                            className="flex-1 bg-secondary rounded-2xl p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden group active:scale-[0.98] transition-all text-left"
                        >
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/20 rounded-full blur-xl transition-all group-hover:bg-white/30"></div>
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-50 transition-opacity">
                                <span className="material-symbols-outlined text-[#22262a] text-lg">edit</span>
                            </div>

                            <div className="flex justify-between items-start">
                                <p className="text-[#22262a]/70 text-sm font-semibold">当前体重</p>
                                <span className="material-symbols-outlined text-[#22262a]/50 text-xl">monitor_weight</span>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-3xl font-bold text-[#22262a] tracking-tight">{user.currentWeight}</h3>
                                    <span className="text-base font-medium text-[#22262a]/70">kg</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-[#22262a]/60 text-xs font-medium">
                                    <span className="material-symbols-outlined text-sm">trending_down</span>
                                    <span>累计减重 {(user.startWeight - user.currentWeight).toFixed(1)}kg</span>
                                </div>
                            </div>
                        </button>

                        {/* Goal Weight Card */}
                        <button
                            onClick={() => openWeightModal('goal')}
                            className="flex-1 bg-secondary rounded-2xl p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden group active:scale-[0.98] transition-all text-left"
                        >
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-xl transition-all group-hover:bg-white/30"></div>
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-50 transition-opacity">
                                <span className="material-symbols-outlined text-[#22262a] text-lg">edit</span>
                            </div>

                            <div className="flex justify-between items-start">
                                <p className="text-[#22262a]/70 text-sm font-semibold">目标体重</p>
                                <span className="material-symbols-outlined text-[#22262a]/50 text-xl">flag</span>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-3xl font-bold text-[#22262a] tracking-tight">{user.goalWeight}</h3>
                                    <span className="text-base font-medium text-[#22262a]/70">kg</span>
                                </div>
                                <div className="mt-3 w-full bg-[#22262a]/10 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{width: `${progressPercent}%`}}></div>
                                </div>
                                <p className="text-[#22262a]/60 text-xs font-medium mt-1 text-right">
                                    距离目标 {(user.currentWeight - user.goalWeight).toFixed(1)}kg
                                </p>
                            </div>
                        </button>
                    </div>

                    {/* New: Body Profile Card (Calculates Calories) */}
                    <button
                        onClick={openBodyDataModal}
                        className="w-full bg-white dark:bg-surface-light/5 rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-all group border border-transparent hover:border-primary/10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">accessibility_new</span>
                            </div>
                            <div className="text-left">
                                <p className="text-gray-900 dark:text-white text-sm font-bold">身体档案</p>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">
                                    {user.gender === 'male' ? '男' : '女'} • {user.age}岁 • {user.height}cm • {getActivityLabel(user.activityLevel).split(' ')[0]}
                                </p>
                            </div>
                        </div>
                        <div className="text-right mr-2">
                            <p className="text-xs text-gray-400 font-medium">推荐摄入</p>
                            <p className="text-xl font-bold text-primary">{tdee} <span className="text-sm text-gray-400">kcal</span></p>
                        </div>
                    </button>

                    {/* Start Weight Card */}
                    <button
                        onClick={() => openWeightModal('start')}
                        className="w-full bg-white dark:bg-surface-light/5 rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-all group border border-transparent hover:border-primary/10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                <span className="material-symbols-outlined">history</span>
                            </div>
                            <div className="text-left">
                                <p className="text-gray-900 dark:text-white text-sm font-bold">初始体重</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1 mr-2 group-hover:text-primary transition-colors">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.startWeight}</h3>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">kg</span>
                            <span className="material-symbols-outlined text-gray-300 text-lg ml-2 group-hover:text-primary/50">edit</span>
                        </div>
                    </button>

                </div>
            </section>
        </div>
    );
};