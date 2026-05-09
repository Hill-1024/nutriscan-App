# NutriScan

中文 | [English](./README.en.md) | [日本語](./README.ja.md)

NutriScan 是一个基于 React + Capacitor 的热量与营养摄入记录应用。它通过手机相机拍摄食物，再调用 Gemini 或 OpenAI 兼容视觉模型识别食物名称、热量和三大营养素，并把饮食记录保存在本地。

这个项目的核心不是“拍照炫技”，而是把日常饮食记录做得足够轻：拍摄、确认、保存、回看趋势，尽量减少手动输入成本。

## 功能特性

- **拍照识别食物**: 使用相机拍摄食物图片，并请求视觉模型返回结构化 JSON。
- **包装食品识别**: Prompt 会优先读取包装上的净含量、规格、份量和热量信息。
- **多模型配置**: 支持 Gemini Key，也支持 OpenAI 兼容接口、Base URL 和模型名配置。
- **本地记录**: 餐食、用户资料和历史数据通过 Capacitor Preferences 或本地存储保存。
- **营养看板**: 展示热量、蛋白质、碳水、脂肪等统计信息。
- **移动端体验**: 使用 Capacitor 打包 Android 应用，支持系统返回键和相机权限。

## 技术栈

- React 18
- React Router
- Recharts
- Tailwind CSS
- Vite
- Capacitor Android
- Google GenAI SDK
- OpenAI-compatible Chat Completions API

## 环境变量

在仓库根目录创建 `.env`。至少配置一种模型服务：

```env
GEMINI_API_KEY=your_gemini_key
```

或使用 OpenAI 兼容视觉模型：

```env
OPENAI_API_KEY=your_openai_compatible_key
OPENAI_BASE_URL=https://api.example.com
OPENAI_MODEL_NAME=your-vision-model
```

也支持 Vite 前缀变量：

```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_OPENAI_API_KEY=your_openai_compatible_key
VITE_API_BASE_URL=https://api.example.com
VITE_MODEL_NAME=your-vision-model
```

不要把 `.env` 或真实 API Key 提交到仓库。

## 快速开始

```bash
npm install
npm run dev
```

Web 开发模式适合调试页面和基础流程；完整相机与 Android 权限行为请在真机或模拟器中验证。

## 构建 Web

```bash
npm run build
npm run preview
```

## Android 构建流程

首次添加 Android 平台：

```bash
npm run cap:add
```

同步 Web 构建、版本信息、图标资源和 Capacitor 项目：

```bash
npm run cap:sync
```

随后可使用 Android Studio 打开 `android/` 目录进行真机调试或打包。

## 项目结构

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

| 路径 | 说明 |
| --- | --- |
| `services/aiService.ts` | Gemini 与 OpenAI 兼容视觉模型调用、JSON 清洗和错误兜底 |
| `hooks/useMealStorage.ts` | 餐食记录持久化 |
| `hooks/useUserStorage.ts` | 用户资料持久化 |
| `pages/Camera.tsx` | 拍摄入口 |
| `pages/ScanResult.tsx` | 识别结果确认 |
| `pages/Dashboard.tsx` | 今日数据与营养概览 |
| `pages/History.tsx` | 历史记录 |

## 数据与隐私

- 饮食记录和用户资料默认保存在本地。
- AI 识图会把照片内容发送给你配置的模型服务。
- 如果使用第三方 OpenAI 兼容服务，请自行确认其数据保留和隐私政策。
- 不建议把包含个人饮食、身体数据或 API Key 的文件提交到仓库。

## 许可证

本项目使用 Apache License 2.0。详见 [LICENSE](./LICENSE)。
