import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import { UserProfile } from '../types';

const STORAGE_KEY = 'nutriscan_user_profile_v1';

const INITIAL_PROFILE: UserProfile = {
    name: 'Alex',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCc8Qmk-foq2REVPQj9So5Z9HIzS4ildi0BiDf98kjmE1Ic4mb6zOyXTLb8Sd_V12Ii61qMavX6req9W5lUaiAHSzLh6zU72ps0r4hWAZ2sUhpFuSjOwLbkmEQJEdKjaPiaVhaXO93Ymg5lCzvl0SZPlJ_GvAq0zEVEzC2IIScvuQyCKHOm27BXI1WFjwg-D7KXU-vYAXzWdBllXa-2_ZieXUANnNevAl46JKD1m8fTKWdTE8-klpHDEBDErh7Y93P-XrQhIMhMw',
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
                // Merge with initial profile to ensure new fields (age, height etc) exist if loading old data
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