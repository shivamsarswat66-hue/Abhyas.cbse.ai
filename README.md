# Abhyas.cbse.ai

CBSE Class 12 board mock tests (full paper + chapter-wise + PYQ packs).  
Android app — **not a PWA**. Install the `.apk` from GitHub.

There is **no website** at `abhyas.cbse.ai` — that name is only the app id. Download the APK from GitHub.

## Download the APK

1. Repo → **Actions** → **Build Android APK** → latest **green** run → **Artifacts** → `Abhyas-CBSE`.
2. Or **Releases** → `app-debug.apk`.

Allow **Install unknown apps** on the phone, then open the file.

## Source

- `src/` — exam console
- `android/` — native Android (`ai.cbse.abhyas`)
- `.github/workflows/build-apk.yml` — compiles the APK

```bash
npm install
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```
