import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/glass-library.module.css';

// ── App data matching the screenshot ──────────────────────────────
const APP_FOLDERS = [
  {
    id: 'productivity',
    label: 'الإنتاجية',
    labelEn: 'Productivity',
    apps: [
      { name: 'واتساب',    color: '#25D366', icon: '💬', badge: null },
      { name: 'جميني',     color: '#4285F4', icon: '✦',  badge: null },
      { name: 'إنستغرام', color: '#E1306C', icon: '📸', badge: null },
      { name: 'تيليجرام', color: '#0088CC', icon: '✈️', badge: null },
      { name: 'ChatGPT',  color: '#1a1a1a', icon: '⬡',  badge: null },
      { name: 'Gmail',    color: '#EA4335', icon: '✉️', badge: 865  },
      { name: 'مزيد',     color: 'multi',   icon: null,  badge: null },
    ],
  },
  {
    id: 'social',
    label: 'التواصل',
    labelEn: 'Social',
    apps: [
      { name: 'هاتف',     color: '#34C759', icon: '📞', badge: 56   },
      { name: 'فيسبوك',   color: '#1877F2', icon: '📘', badge: 369  },
      { name: 'تيك توك',  color: '#000000', icon: '🎵', badge: null },
      { name: 'رسائل',    color: '#34C759', icon: '💬', badge: null },
      { name: 'مزيد',     color: 'multi',   icon: null,  badge: null },
    ],
  },
  {
    id: 'entertainment',
    label: 'الترفيه',
    labelEn: 'Entertainment',
    apps: [
      { name: 'يوتيوب',   color: '#FF0000', icon: '▶',  badge: 57   },
      { name: 'MBC',      color: '#1a1a1a', icon: '📺', badge: null },
      { name: 'فائز',     color: '#6c61f6', icon: '⭐', badge: null },
      { name: 'تشغيل',    color: '#FF6B35', icon: '▶️', badge: 1    },
      { name: 'مزيد',     color: 'multi',   icon: null,  badge: null },
    ],
  },
  {
    id: 'finance',
    label: 'المالية',
    labelEn: 'Finance',
    apps: [
      { name: 'محفظة',    color: '#C0201E', icon: '👛', badge: null },
      { name: 'بنك',      color: '#009B77', icon: '🏦', badge: null },
      { name: 'استثمار',  color: '#6B3FA0', icon: '📈', badge: null },
      { name: 'موبايل',   color: '#0055A5', icon: '📱', badge: null },
      { name: 'مزيد',     color: 'multi',   icon: null,  badge: null },
    ],
  },
  {
    id: 'utilities',
    label: 'المرافق',
    labelEn: 'Utilities',
    apps: [
      { name: 'كروم',     color: '#4285F4', icon: '🌐', badge: null },
      { name: 'إعدادات',  color: '#8E8E93', icon: '⚙️', badge: 3    },
      { name: 'سجل',      color: '#FF3B30', icon: '🎤', badge: null },
      { name: 'حاسبة',    color: '#1C1C1E', icon: '🔢', badge: null },
      { name: 'مزيد',     color: 'multi',   icon: null,  badge: null },
    ],
  },
  {
    id: 'creativity',
    label: 'الإبداع',
    labelEn: 'Creativity',
    apps: [
      { name: 'كاميرا',   color: '#1a1a1a', icon: '📷', badge: null },
      { name: 'مقطع',     color: '#FF6B35', icon: '✂️', badge: 5    },
      { name: 'تلاشي',    color: '#1C1C1E', icon: '🎬', badge: null },
      { name: 'نجوم',      color: '#7C3AED', icon: '⭐', badge: null },
      { name: 'مزيد',     color: 'multi',   icon: null,  badge: null },
    ],
  },
  {
    id: 'games',
    label: 'الألعاب',
    labelEn: 'Games',
    apps: [
      { name: 'طائرة',    color: '#87CEEB', icon: '✈',  badge: null },
      { name: 'نينجا',    color: '#1a1a1a', icon: '🥷', badge: null },
      { name: 'دولينجو',  color: '#58CC02', icon: '🦉', badge: 7    },
      { name: 'أونو',     color: '#e11d48', icon: '🃏', badge: 1    },
      { name: 'مزيد',     color: 'multi',   icon: null,  badge: null },
    ],
  },
  {
    id: 'education',
    label: 'التعليم',
    labelEn: 'Education',
    apps: [
      { name: 'أنكي',     color: '#1565C0', icon: '📚', badge: null },
      { name: 'DW',       color: '#E63946', icon: '🗞',  badge: null },
      { name: 'كتب',      color: '#34C759', icon: '📖', badge: null },
      { name: 'مزيد',     color: 'multi',   icon: null,  badge: null },
    ],
  },
];

function AppIcon({ app }: { app: typeof APP_FOLDERS[0]['apps'][0] }) {
  const isMulti = app.color === 'multi';
  return (
    <div className={styles.iconWrap}>
      {app.badge != null && (
        <span className={styles.badge}>{app.badge > 99 ? '99+' : app.badge}</span>
      )}
      <div
        className={styles.appIcon}
        style={isMulti ? {} : { background: app.color }}
      >
        {isMulti ? (
          <div className={styles.microGrid}>
            {['#8B5CF6','#EC4899','#3B82F6','#10B981'].map((c, i) => (
              <div key={i} className={styles.microDot} style={{ background: c }} />
            ))}
          </div>
        ) : (
          <span className={styles.iconEmoji}>{app.icon}</span>
        )}
      </div>
    </div>
  );
}

function FolderCard({ folder, index }: { folder: typeof APP_FOLDERS[0]; index: number }) {
  const [pressed, setPressed] = useState(false);
  const mainApps = folder.apps.slice(0, 4);
  const secondRow = folder.apps.slice(4);

  return (
    <div
      className={`${styles.folderOuter} ${pressed ? styles.folderPressed : ''}`}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Glass panel — liquid-panel tier */}
      <div className={styles.folderGlass}>
        {/* Inner specular rim */}
        <div className={styles.specularRim} />

        {/* App grid */}
        <div className={styles.iconGrid}>
          {mainApps.map((app, i) => (
            <AppIcon key={i} app={app} />
          ))}
        </div>

        {secondRow.length > 0 && (
          <div className={styles.iconGridSecond}>
            {secondRow.map((app, i) => (
              <AppIcon key={i} app={app} />
            ))}
          </div>
        )}
      </div>

      <p className={styles.folderLabel}>{folder.label}</p>
    </div>
  );
}

export default function GlassLibraryPage() {
  const [time, setTime] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <Head>
        <title>مكتبة التطبيقات — نظام Liquid Glass</title>
        <meta name="description" content="عرض تصميم Liquid Glass المستوحى من iOS App Library" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className={styles.phoneFrame}>
        {/* ── Wallpaper ── */}
        <div className={styles.wallpaper} />
        <div className={styles.wallpaperOverlay} />

        {/* ── Bokeh orbs (decorative) ── */}
        <div className={styles.bokehOrbs}>
          <div className={`${styles.orb} ${styles.orb1}`} />
          <div className={`${styles.orb} ${styles.orb2}`} />
          <div className={`${styles.orb} ${styles.orb3}`} />
          <div className={`${styles.orb} ${styles.orb4}`} />
        </div>

        {/* ── Status Bar ── */}
        <div className={styles.statusBar}>
          <span className={styles.statusTime}>{time || '18:19'}</span>
          <div className={styles.dynamicIsland} />
          <div className={styles.statusRight}>
            <svg width="17" height="12" viewBox="0 0 17 12" fill="white" opacity="0.9">
              <rect x="0"  y="3" width="3" height="9" rx="1" />
              <rect x="4.5" y="2" width="3" height="10" rx="1" />
              <rect x="9" y="0" width="3" height="12" rx="1" />
              <rect x="13.5" y="0" width="3" height="12" rx="1" opacity="0.3"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 24 18" fill="white" opacity="0.9">
              <path d="M12 3.5C16.5 3.5 20.5 5.5 23 8.8L12 18 1 8.8C3.5 5.5 7.5 3.5 12 3.5z"/>
              <path d="M12 7C15.1 7 17.9 8.4 19.8 10.6L12 18 4.2 10.6C6.1 8.4 8.9 7 12 7z" opacity="0.6"/>
              <path d="M12 10.5c1.7 0 3.3.7 4.4 1.9L12 18l-4.4-5.6c1.1-1.2 2.7-1.9 4.4-1.9z" opacity="0.3"/>
            </svg>
            <div className={styles.battery}>
              <div className={styles.batteryBody}>
                <div className={styles.batteryFill} style={{ width: '81%' }} />
              </div>
              <div className={styles.batteryNub} />
            </div>
          </div>
        </div>

        {/* ── Scroll container ── */}
        <div className={styles.scrollArea}>
          {/* ── Search Bar ── */}
          <div className={`${styles.searchBar} ${searchFocused ? styles.searchFocused : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className={styles.searchInput}
              placeholder="مكتبة التطبيقات"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              readOnly
            />
          </div>

          {/* ── App Folders Grid ── */}
          <div className={styles.foldersGrid}>
            {APP_FOLDERS.map((folder, i) => (
              <FolderCard key={folder.id} folder={folder} index={i} />
            ))}
          </div>

          {/* ── Page dots ── */}
          <div className={styles.pageDots}>
            {[0,1,2].map(i => (
              <div key={i} className={`${styles.dot} ${i === 0 ? styles.dotActive : ''}`} />
            ))}
          </div>
        </div>

        {/* ── Home indicator ── */}
        <div className={styles.homeIndicator} />
      </div>
    </>
  );
}
