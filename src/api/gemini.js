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

export async function getAI(prompt, history) {

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      temperature: 0.4,
      maxOutputTokens: 1000,
      tools: [{urlContext: {}}, {googleSearch: {}}, {codeExecution:{}}],
    },
    history,
  });

  return chat.sendMessage({message: prompt})
    .then(result => result.text)
    .catch(error => `${error.message.split('\n')[0]}`);
}

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

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
      config: {
      temperature: 0.4,
      maxOutputTokens: 1000,
      tools: [{urlContext: {}}, {googleSearch: {}}],
    },
    contents: contents,
  });

  return response.text;

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    // config: {
    //   temperature: 0.4,
    //   maxOutputTokens: 1000,
    //   tools: [{urlContext: {}}, {googleSearch: {}}, {codeExecution:{}}],
    // },
    contents,
  });

  return chat.sendMessage({message: prompt})
    .then(result => result.text)
    .catch(error => `${error.message.split('\n')[0]}`);
}

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

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
      config: {
      temperature: 0.4,
      maxOutputTokens: 1000,
      tools: [{urlContext: {}}, {googleSearch: {}}],
    },
    contents: contents,
  });

  console.log("getAiVoice: " + response.text );
  

  return response.text;

}