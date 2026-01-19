import { UserProfile } from '../types';

/**
 * Calculates the daily calorie target using the Mifflin-St Jeor Equation.
 * 
 * BMR Formulas:
 * Men: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 * Women: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
 */
export const calculateDailyCalorieTarget = (user: UserProfile): number => {
    // 1. Calculate Basal Metabolic Rate (BMR)
    let bmr = (10 * user.currentWeight) + (6.25 * user.height) - (5 * user.age);
    
    if (user.gender === 'male') {
        bmr += 5;
    } else {
        bmr -= 161;
    }

    // 2. Calculate Total Daily Energy Expenditure (TDEE) based on Activity Level
    let multiplier = 1.2; // Default Sedentary
    switch (user.activityLevel) {
        case 'sedentary': // Little to no exercise
            multiplier = 1.2;
            break;
        case 'light': // Light exercise (1-3 days per week)
            multiplier = 1.375;
            break;
        case 'moderate': // Moderate exercise (3-5 days per week)
            multiplier = 1.55;
            break;
        case 'active': // Heavy exercise (6-7 days per week)
            multiplier = 1.725;
            break;
        case 'very_active': // Very heavy exercise (twice per day, extra heavy workouts)
            multiplier = 1.9;
            break;
    }

    const tdee = bmr * multiplier;

    // 3. Adjust for Goal (Deficit or Surplus)
    // Standard sustainable weight loss/gain is approx 0.5kg per week (~500kcal/day)
    let target = tdee;

    // Simple heuristic: if goal is lower than current, lose weight. If higher, gain.
    // Allow a buffer of 0.5kg for maintenance
    if (user.goalWeight < user.currentWeight - 0.5) {
        target -= 500; // Deficit for weight loss
    } else if (user.goalWeight > user.currentWeight + 0.5) {
        target += 300; // Surplus for weight gain (usually smaller than deficit to avoid fat gain)
    }

    // Safety bounds: Never recommend dangerously low calories without medical supervision
    const MIN_CALORIES = user.gender === 'male' ? 1500 : 1200;
    
    return Math.max(Math.round(target), MIN_CALORIES);
};

export const getActivityLabel = (level: string): string => {
    switch (level) {
        case 'sedentary': return '久坐少动';
        case 'light': return '轻度运动 (每周1-3次)';
        case 'moderate': return '中度运动 (每周3-5次)';
        case 'active': return '积极运动 (每周6-7次)';
        case 'very_active': return '专业/高强度';
        default: return '久坐少动';
    }
};