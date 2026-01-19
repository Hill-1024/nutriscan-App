import { Meal } from '../types';

const STORAGE_KEY = 'nutriscan_meals_db_v1';

// Helper to get Local YYYY-MM-DD
const getLocalTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Initial mock data to populate if storage is empty
const INITIAL_DATA: Meal[] = [
  {
    id: '1',
    name: 'Oatmeal with Berries',
    type: 'Breakfast',
    time: '08:30 AM',
    calories: 350,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpaeR22QymxTIADVfnpAjc9tQ8-k0GRWxC72gfQDjnRSQKnfzpCKKZQsZkbu2oUcsSwIq5NGJ8oFKwyaN0_8e9fudVNAVK7W1orizT9gevqdRzZQgJ-lO-xhJxlqDKBn0pL_iGUzP64iplEQMO_-j6IDZ5GoDiJFnBtlYoizP8xpN93lbimeh643ujIZX44bMvc2DqUMRt1NLEqB8Frc0peHKO8AkAa5oStq1hHoNA-sieI6l9Y1LiwDfCv9_JnXorzAQb_X_Jog',
    date: getLocalTodayDate(),
    timestamp: Date.now() - 10000000
  },
  {
    id: '2',
    name: 'Grilled Chicken Salad',
    type: 'Lunch',
    time: '01:15 PM',
    calories: 450,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-oGecJnqENgkEMmPsE9qDMPUGiOYjQix-PxU3EqbbnxU3_wicbpXsMl3gHPDhcdCJ_KBKsD5AyGhJpsW7zSDm0BsgAJrF4RNFLX9zBGeGwB61YnKb-I8Fu8J7EVYs6RBsnHVuS8W30Xu5o9MZjnWctFT6dReo8dIKAlJdhGguS8M0CxlfliJ3CKH3KH2Mmz4MPQtcQZpYA4ADCZw-t1ELKGW910NPomDITVNJ875slCKI8mDFEyRJCzA74x-sRItW1UjSCZWP-A',
    date: getLocalTodayDate(),
    timestamp: Date.now() - 5000000
  }
];

export const getMeals = (): Meal[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize with mock data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error reading meals", e);
    return [];
  }
};

export const addMeal = (meal: Meal): void => {
  const meals = getMeals();
  const updatedMeals = [meal, ...meals];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMeals));
};

export const getTodayMeals = (): Meal[] => {
  const meals = getMeals();
  const today = getLocalTodayDate();
  return meals.filter(m => m.date === today).sort((a, b) => b.timestamp - a.timestamp);
};

export const getHistory = (): Record<string, Meal[]> => {
  const meals = getMeals();
  // Group by date
  return meals.reduce((acc, meal) => {
    if (!acc[meal.date]) {
      acc[meal.date] = [];
    }
    acc[meal.date].push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);
};

export const calculateDailyCalories = (meals: Meal[]): number => {
  return meals.reduce((sum, meal) => sum + meal.calories, 0);
};

export const inferMealType = (hour: number): 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' => {
  if (hour >= 5 && hour < 11) return 'Breakfast';
  if (hour >= 11 && hour < 15) return 'Lunch';
  if (hour >= 17 && hour < 22) return 'Dinner';
  return 'Snack';
};