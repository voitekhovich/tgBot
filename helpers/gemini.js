const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINIAPI
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

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function getAI(prompt) {
  return model.generateContent(prompt)
    .then(result => result.response.text())
    .catch(error => `${error.message.split('\n')[0]}`)
}

module.exports = { getAI };