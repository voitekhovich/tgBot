import { GoogleGenAI } from "@google/genai";

// const apiKey = process.env.GEMINIAPI
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

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});


// Gemini Text generation
export async function getAI(prompt, history) {

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      temperature: 0.4,
      maxOutputTokens: 1000,
      tools: [{ urlContext: {} }, { googleSearch: {} }, { codeExecution: {} }],
      thinkingConfig: {
        thinkingBudget: -1,
      },
      systemInstruction: `Ты дружелюбный ассистент. Находишься в городе минск.
                          У тебя свободный стиль общения, без ограничений по темам.
                          Проверяй факты. Старайся отвечать кратко.`,
    },
    history,
  });

  return chat.sendMessage({ message: prompt })
    .then(result => result.text)
    .catch(error => `${error.message.split('\n')[0]}`);
}


// Gemini Image understanding
export async function getAiImg(prompt, base64ImageFile, mimeType) {

  const contents = [
    {
      inlineData: {
        mimeType: mimeType,
        data: base64ImageFile,
      },
    },
    { text: prompt },
  ];

  try {

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        temperature: 0.4,
        maxOutputTokens: 1000,
        tools: [{ urlContext: {} }, { googleSearch: {} }],
      },
      contents: contents,
    });

    return response.text;

  } catch (error) {
    return `${error.message.split('\n')[0]}`
  }

}


// Gemini Audio understanding
export async function getAiVoice(promt, base64AudioFile, mimeType) {

  const safePrompt = promt && promt.trim() ? promt : "Сделай транскрибацию";

  const contents = [
    {
      inlineData: {
        mimeType: mimeType,
        data: base64AudioFile,
      },
    },
    { text: safePrompt },
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        temperature: 0.4,
        maxOutputTokens: 1000,
        tools: [{ urlContext: {} }, { googleSearch: {} }],
      },
      contents: contents,
    });

    console.log("getAiVoice: " + response.text);

    return response.text;

  } catch (error) {
    return `${error.message.split('\n')[0]}`;
  }

}