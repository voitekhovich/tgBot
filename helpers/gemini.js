const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINIAPI

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function getAI() {
  const prompt = "Explain how AI works";

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
}

module.exports = { getAI };