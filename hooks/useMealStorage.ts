import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Meal } from '../types';

const STORAGE_KEY = 'nutriscan_meals_db_cap_v1';

// Helper to get Local YYYY-MM-DD
const getLocalTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Initial mock data with macros for demonstration
const INITIAL_DATA: Meal[] = [
  {
    id: '1',
    name: 'Oatmeal with Berries',
    type: 'Breakfast',
    time: '08:30 AM',
    calories: 350,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpaeR22QymxTIADVfnpAjc9tQ8-k0GRWxC72gfQDjnRSQKnfzpCKKZQsZkbu2oUcsSwIq5NGJ8oFKwyaN0_8e9fudVNAVK7W1orizT9gevqdRzZQgJ-lO-xhJxlqDKBn0pL_iGUzP64iplEQMO_-j6IDZ5GoDiJFnBtlYoizP8xpN93lbimeh643ujIZX44bMvc2DqUMRt1NLEqB8Frc0peHKO8AkAa5oStq1hHoNA-sieI6l9Y1LiwDfCv9_JnXorzAQb_X_Jog',
    date: getLocalTodayDate(),
    timestamp: Date.now() - 10000000,
    macros: { protein: 12, carbs: 60, fat: 6 }
  },
  {
    id: '2',
    name: 'Grilled Chicken Salad',
    type: 'Lunch',
    time: '01:15 PM',
    calories: 450,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-oGecJnqENgkEMmPsE9qDMPUGiOYjQix-PxU3EqbbnxU3_wicbpXsMl3gHPDhcdCJ_KBKsD5AyGhJpsW7zSDm0BsgAJrF4RNFLX9zBGeGwB61YnKb-I8Fu8J7EVYs6RBsnHVuS8W30Xu5o9MZjnWctFT6dReo8dIKAlJdhGguS8M0CxlfliJ3CKH3KH2Mmz4MPQtcQZpYA4ADCZw-t1ELKGW910NPomDITVNJ875slCKI8mDFEyRJCzA74x-sRItW1UjSCZWP-A',
    date: getLocalTodayDate(),
    timestamp: Date.now() - 5000000,
    macros: { protein: 45, carbs: 12, fat: 20 }
  }
];

export const useMealStorage = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load meals from Capacitor Preferences on mount
  const loadMeals = useCallback(async () => {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      if (value) {
        setMeals(JSON.parse(value));
      } else {
        await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(INITIAL_DATA) });
        setMeals(INITIAL_DATA);
      }
    } catch (error) {
      console.error('Error loading meals from Capacitor Preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  // Save meals to storage
  const saveMealsToStorage = useCallback(async (updatedMeals: Meal[]) => {
    try {
      await Preferences.set({
        key: STORAGE_KEY,
        value: JSON.stringify(updatedMeals),
      });
      setMeals(updatedMeals);
    } catch (error) {
      console.error('Error saving meals to Capacitor Preferences:', error);
    }
  }, []);

  // Add a new meal
  const addMeal = useCallback(async (newMeal: Meal) => {
    const updatedMeals = [newMeal, ...meals];
    await saveMealsToStorage(updatedMeals);
  }, [meals, saveMealsToStorage]);

  // Update an existing meal
  const updateMeal = useCallback(async (updatedMeal: Meal) => {
    const updatedMeals = meals.map(m => m.id === updatedMeal.id ? updatedMeal : m);
    await saveMealsToStorage(updatedMeals);
  }, [meals, saveMealsToStorage]);

  // Remove a meal by ID
  const removeMeal = useCallback(async (id: string) => {
    const updatedMeals = meals.filter((meal) => meal.id !== id);
    await saveMealsToStorage(updatedMeals);
  }, [meals, saveMealsToStorage]);

  // Clear all data
  const clearAllMeals = useCallback(async () => {
    try {
      await Preferences.remove({ key: STORAGE_KEY });
      setMeals([]);
    } catch (error) {
      console.error('Error clearing meals:', error);
    }
  }, []);

  // Get Today's Meals (Local Time)
  const getTodayMeals = useCallback(() => {
    const today = getLocalTodayDate();
    return meals.filter((m) => m.date === today).sort((a, b) => b.timestamp - a.timestamp);
  }, [meals]);

  // Calculate Total Daily Calories (Local Time)
  const getDailyCalories = useCallback(() => {
    const today = getLocalTodayDate();
    const todayMeals = meals.filter((m) => m.date === today);
    return todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  }, [meals]);

  return {
    meals,
    isLoaded,
    addMeal,
    updateMeal,
    removeMeal,
    clearAllMeals,
    getTodayMeals,
    getDailyCalories,
    refresh: loadMeals
  };
};