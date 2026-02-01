import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nutriscan.app',
  appName: 'NutriScan',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Preferences: {
      group: 'NutriScanGroup'
    },
    SplashScreen: {
      backgroundColor: "#ffffff",
      launchShowDuration: 1000,
      launchAutoHide: true,
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;