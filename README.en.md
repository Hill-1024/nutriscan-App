# NutriScan

[中文](./README.md) | English | [日本語](./README.ja.md)

NutriScan is a calorie and nutrition tracking app built with React and Capacitor. It lets you take a photo of food, call Gemini or an OpenAI-compatible vision model, extract the food name, calories, and macronutrients, and keep the meal history locally.

The point is not just camera novelty. NutriScan is designed to make everyday nutrition tracking lighter: capture, confirm, save, and review trends with as little manual entry as possible.

## Features

- **Food recognition from photos**: captures food images and asks a vision model for structured JSON.
- **Packaged food handling**: the prompt asks the model to read net weight, serving size, and calorie labels when visible.
- **Multiple model options**: supports Gemini keys and OpenAI-compatible API key, base URL, and model name configuration.
- **Local records**: meals, user profile, and history are stored through Capacitor Preferences or local storage.
- **Nutrition dashboard**: tracks calories, protein, carbs, and fat.
- **Mobile app workflow**: packaged with Capacitor Android, including camera permission and system back button handling.

## Stack

- React 18
- React Router
- Recharts
- Tailwind CSS
- Vite
- Capacitor Android
- Google GenAI SDK
- OpenAI-compatible Chat Completions API

## Environment Variables

Create `.env` in the repository root. Configure at least one model provider:

```env
GEMINI_API_KEY=your_gemini_key
```

Or use an OpenAI-compatible vision model:

```env
OPENAI_API_KEY=your_openai_compatible_key
OPENAI_BASE_URL=https://api.example.com
OPENAI_MODEL_NAME=your-vision-model
```

Vite-prefixed variables are also supported:

```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_OPENAI_API_KEY=your_openai_compatible_key
VITE_API_BASE_URL=https://api.example.com
VITE_MODEL_NAME=your-vision-model
```

Do not commit `.env` or real API keys.

## Quick Start

```bash
npm install
npm run dev
```

Web development mode is useful for UI and flow debugging. Camera permissions and Android behavior should be verified on a device or emulator.

## Build Web

```bash
npm run build
npm run preview
```

## Android Workflow

Add the Android platform for the first time:

```bash
npm run cap:add
```

Sync the Web build, version metadata, icon resources, and Capacitor project:

```bash
npm run cap:sync
```

Then open `android/` in Android Studio for device debugging or packaging.

## Project Structure

```text
.
├── App.tsx
├── components/
├── hooks/
│   ├── useMealStorage.ts
│   └── useUserStorage.ts
├── pages/
│   ├── Camera.tsx
│   ├── Dashboard.tsx
│   ├── History.tsx
│   ├── Profile.tsx
│   ├── ScanResult.tsx
│   └── Settings.tsx
├── services/
│   ├── aiService.ts
│   ├── mealService.ts
│   └── nutritionService.ts
├── android/
└── capacitor.config.ts
```

| Path | Purpose |
| --- | --- |
| `services/aiService.ts` | Gemini and OpenAI-compatible vision calls, JSON cleanup, and error handling |
| `hooks/useMealStorage.ts` | Meal record persistence |
| `hooks/useUserStorage.ts` | User profile persistence |
| `pages/Camera.tsx` | Camera entry point |
| `pages/ScanResult.tsx` | Recognition result confirmation |
| `pages/Dashboard.tsx` | Daily metrics and nutrition overview |
| `pages/History.tsx` | Historical records |

## Data and Privacy

- Meal records and user profile data are stored locally by default.
- AI recognition sends image content to the model provider you configure.
- If you use a third-party OpenAI-compatible service, review its data retention and privacy policy.
- Do not commit files containing personal diet data, body data, or API keys.

## License

This project is licensed under the Apache License 2.0. See [LICENSE](./LICENSE).
