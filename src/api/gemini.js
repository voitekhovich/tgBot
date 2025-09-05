import { GoogleGenAI } from "@google/genai";

// *************** P R O X Y ***************

const proxy = process.env.PROXY

// Подменяем fetch для перехвата запросов и проксирования через Cloudflare Workers
const originalFetch = globalThis.fetch;
globalThis.fetch = (url, options) => {
  const proxyUrl = proxy; // Адрес прокси
  if (typeof url === "string" && url.startsWith("https://generativelanguage.googleapis.com")) {
    url = url.replace("https://generativelanguage.googleapis.com", proxyUrl);
  }
  return originalFetch(url, options);
};

// *************** G E M I N I ***************

const CONFIG = {
  temperature: 0.4,
  maxOutputTokens: 1000,
  // outputTokenLimit: 1000,
  thinkingConfig: { thinkingBudget: -1 },
  tools: [
    { urlContext: {} },
    { googleSearch: {} }
  ],
  systemInstruction: `Ты дружелюбный ассистент. Геолокация - Минск.
                      Общайся свободно, проверяй факты и отвечай коротко. Отвечай обычным текстом`,
};

// Инициализируем GenAI клиент
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function handleGeminiResponse(prompt, history) {
  try {
    // Отправляем запрос в Gemini API
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: CONFIG,
      history
    });

    const response = await chat.sendMessage({
      message: prompt,
    });

    return response.text;
  } catch (error) {
    handleApiError(error);
  }
}

function handleApiError(error) {
  if (error.response) {
    console.error("Gemini API Error:", error.response.status, error.response.statusText);
  } else {
    console.error("Unexpected error:", error.message);
  }
  throw new Error("Ошибка при работе с Gemini API");
}

/**
 * Универсальный обработчик Gemini для разных типов файлов
 * @param {string} base64Data - данные файла в base64
 * @param {string} mimeType - MIME-тип файла (image/jpeg, audio/ogg, video/mp4, application/pdf)
 * @param {string} prompt - подсказка для Gemini
 * @param {string} label - метка для логов и ошибок ("изображение", "аудио", "видео", "документ")
 */
export async function handleGeminiFile(base64Data, mimeType, prompt, label) {
  const contents = [
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
    { text: prompt },
  ];

  console.log(`АНАЛИЗИРУЮ ${label.toUpperCase()}...`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    return response.text;
  } catch (error) {
    console.error(`Ошибка при анализе ${label}:`, error);
    throw new Error(`Не удалось обработать ${label}`);
  }
}

export const handleGeminiImage = (data, prompt = "Опиши изображение") =>
  handleGeminiFile(data, "image/jpeg", prompt, "изображение");

export const handleGeminiAudio = (data, prompt = "Транскрибируй сообщение") =>
  handleGeminiFile(data, "audio/ogg", prompt, "аудио");

export const handleGeminiVideo = (data, prompt = "Проанализируй видео") =>
  handleGeminiFile(data, "video/mp4", prompt, "видео");

export const handleGeminiDoc = (data, prompt = "Проанализируй документ") =>
  handleGeminiFile(data, "application/pdf", prompt, "документ");
