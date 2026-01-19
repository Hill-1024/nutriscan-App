
export interface MacroData {
  name: string;
  value: number;
  total: number;
  color: string;
}

export interface Meal {
  id: string;
  name: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  time: string;
  calories: number;
  image: string;
  date: string; // ISO String YYYY-MM-DD
  timestamp: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface ScannedFood {
  name: string;
  calories: number;
  confidence: string;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  image: string; // base64 or url
  sourceModel?: string; // e.g., "Gemini 1.5", "DeepSeek-V2"
}

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface UserProfile {
  name: string;
  avatar: string;
  currentWeight: number;
  goalWeight: number;
  startWeight: number;
  // Biological data for BMR calculation
  gender: Gender;
  age: number;
  height: number; // in cm
  activityLevel: ActivityLevel;
}

export enum AppRoute {
  SPLASH = '/',
  DASHBOARD = '/dashboard',
  CAMERA = '/camera',
  RESULT = '/result',
  PROFILE = '/profile',
  HISTORY = '/history',
  SETTINGS = '/settings',
}