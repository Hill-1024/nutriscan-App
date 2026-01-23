import {GoogleGenAI, HarmBlockThreshold, HarmCategory, Type} from "@google/genai";
import {ScannedFood} from "../types";

// --- Helpers ---

const cleanJsonString = (text: string): string => {
  // Remove markdown code blocks (```json ... ```)
  let clean = text.replace(/```json\n?|```/g, "").trim();
  // Sometimes models output text before the JSON, try to find the first {
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  return clean;
};

const parseResponse = (text: string): any => {
  try {
    return JSON.parse(cleanJsonString(text));
  } catch (e) {
    console.warn("JSON Parse Failed for text:", text);
    return null;
  }
};

const normalizeBaseUrl = (url: string) => {
  if (!url) return "https://api.deepseek.com";
  let clean = url.trim().replace(/\/+$/, ''); // remove trailing slashes
  // Common user mistake: pasting the full endpoint into base URL
  if (clean.endsWith('/chat/completions')) {
    clean = clean.replace('/chat/completions', '');
  }
  return clean;
};

// Polyfill for Promise.any
const promiseAny = async <T>(promises: Promise<T>[]): Promise<T> => {
  return new Promise((resolve, reject) => {
    let errors: Error[] = [];
    let pending = promises.length;

    if (pending === 0) {
      reject(new Error("没有配置任何有效的 API Key"));
      return;
    }

    promises.forEach(promise => {
      Promise.resolve(promise)
          .then(resolve)
          .catch(error => {
            errors.push(error);
            pending--;
            if (pending === 0) {
              const errorMsg = errors.map(e => e.message).join("\n");
              reject(new Error(errorMsg));
            }
          });
    });
  });
};

// --- Gemini Implementation ---

const callGeminiModel = async (ai: GoogleGenAI, modelName: string, base64Image: string): Promise<ScannedFood> => {
  // Enhanced prompt to look for packaging details
  const prompt = `
      Identify the food in this image.
      Important: If this is a packaged food, explicitly look for text on the packaging indicating net weight, volume, or serving size (e.g., "Net Wt", "grams", "ml", "kCal per serving") and use that to calculate the TOTAL calories and macros for the entire item shown.
      If no text is visible or it is not packaged, estimate based on standard visual portion size.
      Return JSON: { "name": "Food Name (Chinese)", "calories": 0, "confidence": "High/Medium/Low", "macros": { "protein": 0, "carbs": 0, "fat": 0 } }
    `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          confidence: { type: Type.STRING },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
            }
          }
        }
      },
      // Disable safety settings to prevent false positives on food images
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_NONE }
      ]
    }
  });

  const text = response.text;
  if (!text) {
    const candidate = response.candidates?.[0];
    console.warn("[Gemini] Empty response text. FinishReason:", candidate?.finishReason, "Safety:", candidate?.safetyRatings);
    throw new Error(`Empty response (FinishReason: ${candidate?.finishReason || 'Unknown'})`);
  }

  const result = parseResponse(text);
  if (!result) throw new Error("JSON parse failed");

  return {
    ...result,
    image: `data:image/jpeg;base64,${base64Image}`,
    sourceModel: modelName
  };
};

const callGemini = async (base64Image: string): Promise<ScannedFood> => {
  console.log("[AI] Attempting Gemini...");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    return await callGeminiModel(ai, "gemini-3-flash-preview", base64Image);
  } catch (error: any) {
    const errMsg = error.message || JSON.stringify(error);

    if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota") || errMsg.includes("Empty response")) {
      console.warn("[AI] Gemini 3 Flash issue. Trying fallback to Flash Latest...");
      try {
        return await callGeminiModel(ai, "gemini-flash-latest", base64Image);
      } catch (err2: any) {
        throw new Error(`Gemini 识别失败: ${errMsg.substring(0, 50)}...`);
      }
    }
    throw new Error(`Gemini Error: ${errMsg.substring(0, 100)}...`);
  }
};

// --- OpenAI/DeepSeek Implementation ---

const callOpenAI = async (base64Image: string, apiKey: string, baseUrl: string, model: string): Promise<ScannedFood> => {
  const cleanBaseUrl = normalizeBaseUrl(baseUrl);
  const endpoint = `${cleanBaseUrl}/chat/completions`;

  console.log(`[AI] Attempting OpenAI Compatible (${model}) at ${cleanBaseUrl}...`);

  const messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          // Updated Chinese prompt to strictly request packaging text analysis
          text: `请识别图中食物。如果是包装食品，请务必仔细寻找并读取包装上的“净含量”、“规格”或“份量”文字（如克、毫升、kCal），并据此计算整个包装的总热量和营养素。若无包装文字，则按视觉标准份量估算。必须返回 JSON 格式：{"name": "中文菜名", "calories": number, "confidence": "High/Medium/Low", "macros": {"protein": number, "carbs": number, "fat": number}}。不要输出其他文字。`
        },
        {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }
      ]
    }
  ];

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      },
      referrerPolicy: "no-referrer",
      credentials: "omit",
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.1,
        stream: false
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[AI] OpenAI Error ${response.status}:`, errText);

      let detailedError = "";
      try {
        const errJson = JSON.parse(errText);
        detailedError = (errJson.error?.message || errJson.message || "").toLowerCase();
      } catch (e) {}

      const isQuotaError = detailedError.includes("balance") || detailedError.includes("quota") || detailedError.includes("credit") || detailedError.includes("payment");

      if (response.status === 401) throw new Error("OpenAI: Key 无效 (401)");
      if (response.status === 402 || (response.status === 403 && isQuotaError)) {
        throw new Error("OpenAI: 余额不足/配额已用完 (请充值)");
      }
      if (response.status === 403) throw new Error("OpenAI: 403 禁止访问 (API防火墙拦截 或 余额不足)");
      if (response.status === 404) throw new Error("OpenAI: 路径错误 (404) - 请检查 Base URL");

      if (response.status === 400 && (errText.includes("vision") || errText.includes("image") || model.includes("deepseek-chat"))) {
        throw new Error(`OpenAI: 模型 ${model} 不支持图片识别。请更换为支持 Vision 的模型 (如 Qwen2-VL)。`);
      }

      throw new Error(`OpenAI Error (${response.status}): ${detailedError || errText.substring(0, 100)}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("OpenAI: 返回数据格式错误 (无 choices)");
    }

    const content = data.choices[0].message?.content;

    if (!content) throw new Error("OpenAI: 返回内容为空");

    const result = parseResponse(content);
    if (!result) {
      console.error("OpenAI Raw Content:", content);
      throw new Error("OpenAI: 无法解析 JSON (查看控制台)");
    }

    return {
      ...result,
      image: `data:image/jpeg;base64,${base64Image}`,
      sourceModel: model
    };
  } catch (error: any) {
    throw error;
  }
};

// --- Main Orchestrator ---

export const identifyFood = async (base64Image: string): Promise<ScannedFood | null> => {
  const geminiKey = process.env.API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  // @ts-ignore
  const envBaseUrl = import.meta.env?.VITE_API_BASE_URL;
  // @ts-ignore
  const envModelName = import.meta.env?.VITE_MODEL_NAME;

  const openAIBaseUrl = process.env.OPENAI_BASE_URL || envBaseUrl || "https://api.deepseek.com";
  const openAIModel = process.env.OPENAI_MODEL_NAME || envModelName || "deepseek-chat";

  const promises: Promise<ScannedFood>[] = [];
  const providersAttempted: string[] = [];

  // Add Gemini Task
  if (geminiKey && geminiKey.length > 5 && !geminiKey.includes("AIzaSy...")) {
    providersAttempted.push("Gemini");
    promises.push(callGemini(base64Image));
  }

  // Add OpenAI/DeepSeek Task
  if (openAIKey && openAIKey.length > 5) {
    providersAttempted.push(`OpenAI(${openAIModel})`);
    promises.push(callOpenAI(base64Image, openAIKey, openAIBaseUrl, openAIModel));
  }

  if (promises.length === 0) {
    const msg = "❌ 未配置有效的 API Key。\n请在 .env 中配置 GEMINI_API_KEY 或 OPENAI_API_KEY。";
    alert(msg);
    throw new Error(msg);
  }

  try {
    return await promiseAny(promises);
  } catch (error: any) {
    console.error("[AI] Race failed:", error);
    const errorList = error.message.split('\n').filter((l:string) => l.trim() !== '');
    const cleanError = errorList.length > 0 ? errorList.join('\n- ') : error.message;

    throw new Error(`所有模型识别失败:\n- ${cleanError}`);
  }
};