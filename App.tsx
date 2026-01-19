import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Splash } from './pages/Splash';
import { Dashboard } from './pages/Dashboard';
import { Camera } from './pages/Camera';
import { ScanResult } from './pages/ScanResult';
import { Profile } from './pages/Profile';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { Navigation } from './components/Navigation';
import { AppRoute } from './types';

const AppContent: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Setup Android hardware back button listener
        let backButtonListener: any;

        const setupListener = async () => {
            backButtonListener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                // Define routes that are considered "root" level where back button should exit the app
                const rootRoutes = [AppRoute.DASHBOARD, AppRoute.SPLASH];

                if (rootRoutes.includes(location.pathname as AppRoute)) {
                    CapacitorApp.exitApp();
                } else {
                    // For all other routes, go back in history
                    navigate(-1);
                }
            });
        };

        setupListener();

        return () => {
            if (backButtonListener) {
                backButtonListener.remove();
            }
        };
    }, [location.pathname, navigate]);

    return (
        <div className="max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark shadow-2xl relative overflow-hidden">
            <Routes>
                <Route path={AppRoute.SPLASH} element={<Splash />} />
                <Route path={AppRoute.DASHBOARD} element={<Dashboard />} />
                <Route path={AppRoute.CAMERA} element={<Camera />} />
                <Route path={AppRoute.RESULT} element={<ScanResult />} />
                <Route path={AppRoute.PROFILE} element={<Profile />} />
                <Route path={AppRoute.HISTORY} element={<History />} />
                <Route path={AppRoute.SETTINGS} element={<Settings />} />
            </Routes>
            <Navigation />
        </div>
    );
};

export default function App() {
    return (
        <HashRouter>
            <AppContent />
        </HashRouter>
    );
}