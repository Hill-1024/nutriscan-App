# NutriScan

[中文](./README.md) | [English](./README.en.md) | 日本語

NutriScan は、React と Capacitor で作られたカロリー・栄養記録アプリです。食べ物をスマートフォンのカメラで撮影し、Gemini または OpenAI 互換の vision モデルで食品名、カロリー、三大栄養素を識別し、食事履歴をローカルに保存します。

このプロジェクトの中心は、単に写真認識を見せることではありません。日常の食事記録を軽くすることです。撮影、確認、保存、傾向確認までを、できるだけ少ない手入力で行えるようにします。

## 主な機能

- **写真から食品を識別**: 食べ物の画像を撮影し、vision モデルに構造化 JSON を返させます。
- **包装食品への対応**: 包装に見える正味量、規格、1 食分、カロリー表記を優先して読むよう prompt を設計しています。
- **複数モデル設定**: Gemini Key と OpenAI 互換 API Key、Base URL、モデル名を設定できます。
- **ローカル記録**: 食事、ユーザープロフィール、履歴は Capacitor Preferences または local storage に保存します。
- **栄養ダッシュボード**: カロリー、タンパク質、炭水化物、脂質を確認できます。
- **モバイル体験**: Capacitor Android により、カメラ権限とシステム戻るボタンに対応します。

## 技術スタック

- React 18
- React Router
- Recharts
- Tailwind CSS
- Vite
- Capacitor Android
- Google GenAI SDK
- OpenAI-compatible Chat Completions API

## 環境変数

リポジトリルートに `.env` を作成します。少なくとも 1 つのモデルサービスを設定してください。

```env
GEMINI_API_KEY=your_gemini_key
```

OpenAI 互換の vision モデルを使う場合：

```env
OPENAI_API_KEY=your_openai_compatible_key
OPENAI_BASE_URL=https://api.example.com
OPENAI_MODEL_NAME=your-vision-model
```

Vite プレフィックス付き変数にも対応しています。

```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_OPENAI_API_KEY=your_openai_compatible_key
VITE_API_BASE_URL=https://api.example.com
VITE_MODEL_NAME=your-vision-model
```

`.env` や実際の API Key をコミットしないでください。

## クイックスタート

```bash
npm install
npm run dev
```

Web 開発モードは UI と基本フローの確認に向いています。カメラ権限や Android 固有の挙動は、実機またはエミュレーターで確認してください。

## Web ビルド

```bash
npm run build
npm run preview
```

## Android ワークフロー

初回のみ Android プラットフォームを追加します。

```bash
npm run cap:add
```

Web ビルド、バージョン情報、アイコンリソース、Capacitor プロジェクトを同期します。

```bash
npm run cap:sync
```

その後、Android Studio で `android/` ディレクトリを開き、実機デバッグまたはパッケージングを行います。

## プロジェクト構成

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

| Path | 説明 |
| --- | --- |
| `services/aiService.ts` | Gemini と OpenAI 互換 vision 呼び出し、JSON 整形、エラー処理 |
| `hooks/useMealStorage.ts` | 食事記録の永続化 |
| `hooks/useUserStorage.ts` | ユーザープロフィールの永続化 |
| `pages/Camera.tsx` | カメラ入口 |
| `pages/ScanResult.tsx` | 識別結果の確認 |
| `pages/Dashboard.tsx` | 当日の指標と栄養概要 |
| `pages/History.tsx` | 履歴記録 |

## データとプライバシー

- 食事記録とユーザープロフィールは既定でローカルに保存されます。
- AI 識別では、画像内容が設定したモデルプロバイダーへ送信されます。
- 第三者の OpenAI 互換サービスを使う場合は、データ保持とプライバシーポリシーを確認してください。
- 個人の食事データ、身体データ、API Key を含むファイルをコミットしないでください。

## ライセンス

このプロジェクトは Apache License 2.0 の下で公開されています。詳しくは [LICENSE](./LICENSE) を参照してください。
