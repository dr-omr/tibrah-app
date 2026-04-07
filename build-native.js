#!/usr/bin/env node
/**
 * Tibrah Native Build Script — build-native.js
 * 
 * Steps:
 *   1. Build Next.js as static export (output: 'export')
 *   2. Sync files to Capacitor Android/iOS
 *   3. Open Android Studio or Xcode (optional)
 * 
 * Usage:
 *   node build-native.js          → Android only
 *   node build-native.js --ios    → iOS only
 *   node build-native.js --all    → Both Android + iOS
 *   node build-native.js --open   → Open in Android Studio after sync
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const buildIOS = args.includes('--ios') || args.includes('--all');
const buildAndroid = !args.includes('--ios') || args.includes('--all');
const openStudio = args.includes('--open');

const ROOT = path.resolve(__dirname);
const OUT_DIR = path.join(ROOT, 'out');

function log(msg, type = 'info') {
    const icons = { info: '📦', success: '✅', warn: '⚠️', error: '❌', step: '🔄' };
    console.log(`${icons[type] || '→'} ${msg}`);
}

function run(cmd, label) {
    log(`${label}...`, 'step');
    try {
        execSync(cmd, { stdio: 'inherit', cwd: ROOT });
        log(`${label} — Done`, 'success');
    } catch (e) {
        log(`${label} — FAILED`, 'error');
        process.exit(1);
    }
}

// ── STEP 1: Verify .env for mobile ──────────────────────────
log('Checking environment variables...', 'step');
const envFile = path.join(ROOT, '.env.local');
if (!fs.existsSync(envFile)) {
    log('.env.local not found — creating template...', 'warn');
    fs.writeFileSync(envFile, `# Tibrah Mobile Build Environment
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
`);
    log('.env.local template created — fill in values before building!', 'warn');
    process.exit(1);
}

// ── STEP 2: Build Next.js Static Export ─────────────────────
run('cross-env BUILD_MODE=mobile next build', 'Next.js Static Export');

// ── STEP 3: Verify output directory ─────────────────────────
if (!fs.existsSync(OUT_DIR)) {
    log('Build output directory "out/" not found — build may have failed', 'error');
    process.exit(1);
}
log(`Static output ready at: ${OUT_DIR}`, 'success');

// ── STEP 4: Capacitor Sync ──────────────────────────────────
run('npx cap sync', 'Capacitor Sync (copy web assets to native)');

// ── STEP 5: Platform-specific builds ────────────────────────
if (buildAndroid) {
    log('Preparing Android build...', 'step');
    if (openStudio) {
        run('npx cap open android', 'Open Android Studio');
    } else {
        // Attempt gradle build for APK (requires Android SDK)
        const gradlew = path.join(ROOT, 'android', 'gradlew');
        if (fs.existsSync(gradlew)) {
            run(
                `cd android && ${process.platform === 'win32' ? 'gradlew.bat' : './gradlew'} assembleDebug`,
                'Gradle Debug APK Build'
            );
            const apkPath = path.join(ROOT, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
            if (fs.existsSync(apkPath)) {
                log(`APK ready → ${apkPath}`, 'success');
            }
        } else {
            log('Android folder not found — run "npx cap add android" first', 'warn');
        }
    }
}

if (buildIOS) {
    if (process.platform !== 'darwin') {
        log('iOS builds require macOS. Skipping...', 'warn');
    } else {
        log('Preparing iOS build...', 'step');
        if (openStudio) {
            run('npx cap open ios', 'Open Xcode');
        } else {
            log('For iOS release — open Xcode manually: npx cap open ios', 'warn');
        }
    }
}

log('', 'info');
log('🎉 Tibrah Native Build Pipeline Complete!', 'success');
log('Next Steps:', 'info');
log('  Android APK → android/app/build/outputs/apk/debug/app-debug.apk', 'info');
log('  iOS → run: npx cap open ios → then Archive in Xcode', 'info');
