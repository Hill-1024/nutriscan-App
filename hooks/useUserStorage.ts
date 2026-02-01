import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import { UserProfile } from '../types';

const STORAGE_KEY = 'nutriscan_user_profile_v1';

// SVG Data URI for default avatar
const DEFAULT_AVATAR = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#71ac53" />
  <circle cx="50" cy="40" r="15" fill="white" />
  <path d="M25 80c0-15 10-25 25-25s25 10 25 25" fill="white" />
</svg>
`.trim())}`;

const INITIAL_PROFILE: UserProfile = {
    name: 'Alex',
    avatar: DEFAULT_AVATAR,
    currentWeight: 64,
    goalWeight: 60,
    startWeight: 66,
    gender: 'female',
    age: 26,
    height: 165,
    activityLevel: 'light'
};

export const useUserStorage = () => {
    const [user, setUser] = useState<UserProfile>(INITIAL_PROFILE);
    const [isLoaded, setIsLoaded] = useState(false);

    const loadProfile = useCallback(async () => {
        try {
            const { value } = await Preferences.get({ key: STORAGE_KEY });
            if (value) {
                // Merge with initial profile to ensure new fields (age, height etc.) exist if loading old data
                const parsed = JSON.parse(value);
                setUser({ ...INITIAL_PROFILE, ...parsed });
            } else {
                await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(INITIAL_PROFILE) });
                setUser(INITIAL_PROFILE);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const updateUser = async (updatedUser: UserProfile) => {
        try {
            setUser(updatedUser);
            await Preferences.set({
                key: STORAGE_KEY,
                value: JSON.stringify(updatedUser),
            });
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    };

    return {
        user,
        isLoaded,
        updateUser,
        refreshUser: loadProfile
    };
};