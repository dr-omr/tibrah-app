import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tibrah.app',
  appName: 'طِبرَا',
  webDir: 'out',

  // ─── Server Config ─────────────────────────────────────────────
  server: {
    androidScheme: 'https',
    // allowNavigation يُحدَّد فقط للنطاقات المسموح بها (أمان)
    allowNavigation: [
      'tibrah.vercel.app',
      '*.firebase.com',
      'firestore.googleapis.com',
    ],
  },

  // ─── Plugins ───────────────────────────────────────────────────
  plugins: {
    // الإشعارات المحلية
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_tibrah',
      iconColor: '#2D9B83',
      sound: 'notification.wav',
    },

    // الإشعارات الـ Push
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    // Splash Screen — يختفي بعد أن يكون التطبيق جاهزاً
    SplashScreen: {
      launchShowDuration: 0,         // نتحكم نحن في الإخفاء
      launchAutoHide: false,          // نُخفيه يدوياً بعد اكتمال التحميل
      launchFadeOutDuration: 500,
      backgroundColor: '#FEFCF5',
      showSpinner: false,             // نستخدم Lottie animation خاصة
      androidSplashResourceName: 'splash',
      splashFullScreen: true,         // يملأ الشاشة الكاملة بما في ذلك notch
      splashImmersive: true,          // يخفي status bar أثناء الـ splash
      iosSpinnerStyle: 'small',
    },

    // Status Bar — نتحكم فيه ديناميكياً من NativeBridge
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FEFCF5',
      overlaysWebView: false,
    },

    // Keyboard — مدار بالكامل من NativeContext
    Keyboard: {
      resize: 'body' as never,
      style: 'DARK' as never,
      resizeOnFullScreen: true,
    },

    // Browser — لفتح روابط خارجية داخل التطبيق
    Browser: {
      toolbarColor: '#2D9B83',
      windowName: 'طِبرَا',
    },
  },

  // ─── iOS Specific ──────────────────────────────────────────────
  ios: {
    // contentInset: 'automatic' يترك iOS يحسب الـ safe area تلقائياً
    contentInset: 'automatic',
    // preferredContentMode: 'mobile' يمنع التطبيق من التصرف كـ desktop
    preferredContentMode: 'mobile',
    // limitsNavigationsToAppBoundDomains: true يمنع تحميل sites خارجية في WebView
    limitsNavigationsToAppBoundDomains: true,
    // scheme: اسم الـ URL scheme الداخلي
    scheme: 'TibrahApp',
    // allowsLinkPreview: false يمنع Long Press preview على الروابط
    allowsLinkPreview: false,
    // scrollEnabled: true نتركه للمحتوى ولكن نتحكم في pull-to-refresh
    scrollEnabled: true,
  },

  // ─── Android Specific ──────────────────────────────────────────
  android: {
    // allowMixedContent: false يمنع HTTP داخل HTTPS (أمان)
    allowMixedContent: false,
    // backgroundColor: لون الخلفية أثناء التحميل
    backgroundColor: '#FEFCF5',
    // webContentsDebuggingEnabled: false في الـ production
    webContentsDebuggingEnabled: false,
    // buildOptions — Gradle settings
    buildOptions: {
      keystorePath: 'tibrah-release.keystore',
      keystoreAlias: 'tibrah',
    },
    // appendUserAgent: نُضيف معرّف للـ platform في الـ requests
    appendUserAgent: 'TibrahNative/Android',
  },
};

export default config;
