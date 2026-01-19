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
    }
  }
};

export default config;