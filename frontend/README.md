# 🫀 CardioGuard — v2

A modern wellness-aesthetic mobile app for AI-powered cardiovascular risk monitoring.
Built with **Expo + React Native + NativeWind v4**.

---

## ✨ What's new in v2

- **Bottom tab navigation** — Home / History / Learn / Profile
- **Real-time wearable simulation** — live HR + SpO₂ streaming with wavy SVG charts
- **Wellness aesthetic** — cream background + lime accent matching modern health apps
- **5-step onboarding** — quick setup, no overwhelming forms
- **Learn CVD** — 6 chapters of educational content
- **Editable profile** with auto-BMI calculation

---

## 🚀 Migration from v1 (replacing the old app)

You already have `cvd-mobile-app` set up. To replace it with v2:

### Step 1 — Back up the old code (optional)

```bat
cd C:\Users\PC\Desktop
ren cvd-mobile-app cvd-mobile-app-v1-backup
```

### Step 2 — Create a fresh project

```bat
npx create-expo-app@latest cvd-mobile-app --template blank
cd cvd-mobile-app
```

### Step 3 — Install dependencies

```bat
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs

npx expo install react-native-screens react-native-safe-area-context

npx expo install axios @react-native-async-storage/async-storage react-native-svg @expo/vector-icons

npm install nativewind react-native-reanimated

npm install --save-dev tailwindcss@^3.4.17 babel-preset-expo
```

### Step 4 — Copy this v2 package over

Extract the zip, then copy everything from inside the `cvd-app-v2/` folder into your project, **replacing** any existing files. The default `App.js` Expo created will be overwritten — that's correct.

After copy, verify these are in place:

```
cvd-mobile-app/
├── App.js                    ← v2 root with AppProvider
├── babel.config.js
├── metro.config.js
├── tailwind.config.js        ← cream + lime palette
├── global.css
├── app.json                  ← CardioGuard branding
└── src/
    ├── components/           ← 7 reusable components
    ├── constants/            ← theme + AppContext
    ├── data/                 ← chapters.js
    ├── navigation/           ← RootNavigator + MainTabs + OnboardingStack
    ├── screens/              ← Home, History, Learn, LearnChapter, Profile
    │   └── onboarding/       ← Splash + 4-step onboarding
    └── services/             ← api.js + wearable.js
```

### Step 5 — Run

```bat
npx expo start --clear
```

Scan the QR with Expo Go on your phone.

---

## 📱 What the user sees

### Onboarding (first launch)
1. **Splash** — brand intro, "Your heart, always in tune."
2. **Personal info** — name, age, sex, height, weight (auto-BMI)
3. **Health factors** — family history, smoking, alcohol
4. **Measure BP** — enter systolic/diastolic from a cuff reading
5. **Connect wearable** — animated pairing flow with skip option

### Main app (4 tabs)
- **Home** — live HR + SpO₂ charts, risk card, vitals snapshot, daily insights
- **History** — week/month/all-time risk trends with bar chart
- **Learn CVD** — 6 chapters: What is CVD / Causes / Symptoms / Prevention / Treatment / Wearables
- **Profile** — view & edit user info, manage device, reset app

---

## 🎨 Design system

| Token | Value | Used for |
|---|---|---|
| `cream` | `#f5f1ea` | Main background |
| `cream-soft` | `#faf7f1` | Elevated surfaces |
| `lime` | `#d4f04a` | Primary accent (highlights, active tabs) |
| `ink` | `#1a1a1a` | Text + dark cards |
| `ink-muted` | `#6b6b6b` | Secondary text |
| `risk-low / med / high` | green / amber / coral | Risk indicators |

Cards use **24-32px border-radius**, generous padding, and the wavy SVG line is the signature visual element across the home screen.

---

## 🔌 Connecting to your FastAPI backend

`src/services/api.js`:

```js
export const MOCK_MODE = true;                            // ← flip to false when backend is ready
export const API_BASE_URL = 'http://192.168.1.100:8000';  // ← your laptop's local IP
```

The backend `/predict` endpoint should accept:

```json
{
  "age": 25, "sex": "Male", "bmi": 22.5,
  "smoking": "No", "alcohol": "No", "family_history": "No",
  "systolic_bp": 120, "diastolic_bp": 80,
  "heart_rate": 72, "spo2": 97
}
```

…and impute the unsent features (cholesterol, glucose, ECG signals) on the server before calling the model.

---

## 🛜 Connecting a real wearable

`src/services/wearable.js` currently simulates streaming. To swap in real BLE:

```js
// 1. Install: npx expo install react-native-ble-plx
// 2. Replace startStream() with:

import { BleManager } from 'react-native-ble-plx';
const manager = new BleManager();

export const startStream = (onReading) => {
  manager.startDeviceScan(null, null, (error, device) => {
    if (device?.name === 'CardioBand Pro') {
      device.connect()
        .then(d => d.discoverAllServicesAndCharacteristics())
        .then(d => d.monitorCharacteristicForService(HR_SERVICE_UUID, HR_CHAR_UUID,
          (err, char) => onReading({ hr: parseHR(char.value), spo2: ..., ts: Date.now() })));
    }
  });
};
```

The rest of the app reads from the same callback, so nothing else changes.

---

## 🐛 Troubleshooting

**"Cannot find module 'babel-preset-expo'"**
→ `npm install --save-dev babel-preset-expo` then `npx expo start --clear`

**"ERR_UNSUPPORTED_ESM_URL_SCHEME"**
→ This is a Node 22 + Windows bug. Either:
  - Downgrade to Node 20 LTS (recommended), OR
  - Move the project to a path with no spaces (e.g. `C:\dev\cardioguard`)

**Tabs not showing / blank screen**
→ Ensure `react-native-reanimated` is installed. Restart with `npx expo start --clear`.

**Real-time charts not updating**
→ Check that `useFocusEffect` is firing — try navigating between tabs and back.

---

**Saint White এ** · Final Year Project · 2026
