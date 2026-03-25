import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tibrah.app',
  appName: 'طِبرَا',
  webDir: 'out',

  // Server config — point to hosted API in mobile builds
  server: {
    // In production, Capacitor loads from local files (webDir)
    // API calls go to your Vercel deployment
    androidScheme: 'https',
  },

  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#2D9B83',
      sound: 'beep.wav',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#FEFCF5', // Match app background
      showSpinner: true,
      spinnerColor: '#2D9B83',
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FEFCF5',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
  },

  // iOS specific
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: true,
    scheme: 'TibrahApp',
  },

  // Android specific
  android: {
    allowMixedContent: false,
    backgroundColor: '#FEFCF5',
    webContentsDebuggingEnabled: true,
  },
};

export default config;
