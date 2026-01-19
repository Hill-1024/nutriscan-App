import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

export default defineConfig(({ mode }) => {
  // Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'" error
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Read version from package.json
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
  const appVersion = packageJson.version;

  // Logic to handle multiple keys or fallback to generic API_KEY
  const geminiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || (env.API_KEY?.startsWith('AIza') ? env.API_KEY : "") || "";
  const openAIKey = env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY || (env.API_KEY?.startsWith('sk-') ? env.API_KEY : "") || "";

  const openAIBaseUrl = env.VITE_API_BASE_URL || env.OPENAI_BASE_URL || "https://api.deepseek.com";
  const openAIModelName = env.VITE_MODEL_NAME || env.OPENAI_MODEL_NAME || "deepseek-chat";

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(geminiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      'process.env.OPENAI_API_KEY': JSON.stringify(openAIKey),
      'process.env.OPENAI_BASE_URL': JSON.stringify(openAIBaseUrl),
      'process.env.OPENAI_MODEL_NAME': JSON.stringify(openAIModelName),
      'process.env.APP_VERSION': JSON.stringify(appVersion)
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true
    }
  };
});