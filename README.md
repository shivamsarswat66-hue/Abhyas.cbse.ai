# Abhyas.cbse.ai

CBSE Class 12 board mock tests (full paper + chapter-wise + PYQ packs).  
Android app — **not a PWA**. Install the `.apk` from GitHub.

## Download the APK

1. Open this repo on GitHub → **Actions** → workflow **Build Android APK** → latest run → **Artifacts** → `Abhyas-CBSE`.
2. Or **Releases** on the right → download `app-debug.apk`.

Allow “Install unknown apps” on your phone, then open the file.

## Source

- `src/` — React exam console (timer, palette, mark-for-review, analytics)
- `android/` — native Capacitor Android project (`ai.cbse.abhyas`)
- `.github/workflows/build-apk.yml` — CI that compiles the APK

## Build APK on your PC

Needs Node 20 + JDK 17 + Android SDK.

```bash
npm install
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

APK path: `android/app/build/outputs/apk/debug/app-debug.apk`
