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

// Generates a simple colored SVG placeholder data URI
const generatePlaceholder = (color: string, text: string) => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="${color}" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="white" font-weight="bold">${text}</text>
  </svg>
  `.trim();
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Initial mock data to populate if storage is empty
const INITIAL_DATA: Meal[] = [
  {
    id: '1',
    name: 'Oatmeal with Berries',
    type: 'Breakfast',
    time: '08:30 AM',
    calories: 350,
    image: generatePlaceholder('#FFB7B2', 'Oatmeal'),
    date: getLocalTodayDate(),
    timestamp: Date.now() - 10000000
  },
  {
    id: '2',
    name: 'Grilled Chicken Salad',
    type: 'Lunch',
    time: '01:15 PM',
    calories: 450,
    image: generatePlaceholder('#B5EAD7', 'Salad'),
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