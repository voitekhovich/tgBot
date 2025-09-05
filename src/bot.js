import 'dotenv/config';

// Импортируем необходимые библиотеки
import { Telegraf } from "telegraf";
import { handleGeminiResponse, handleGeminiImage, handleGeminiAudio, handleGeminiVideo, handleGeminiDoc } from "./gemini.js";
import logger from "./logger.js";
import { addMessage, getMemory, logMemory, resetMemory } from './memory.js';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN не задан в .env");
}

// Создаем экземпляр бота
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);


bot.telegram.setMyCommands([
  { command: "reset", description: "Сброс диалога" },
]);


bot.command("reset", async (ctx) => {
  resetMemory(ctx.chat.id);
  await ctx.reply("Диалог сброшен 🧹");
});


bot.on("message", async (ctx) => {
  const msg = ctx.message;
  const thinkingMsg = await ctx.reply("Размышляю...");

  try {
    let geminiResponse;
    let caption;

    // --- 1. Ответ на сообщение ---
    if (msg.reply_to_message) {
      const replied = msg.reply_to_message;
      caption = msg.text || msg.caption || "Проанализируй это сообщение";

      geminiResponse = await processMessageContent(ctx, replied, caption);

      // --- 2. Пересланное сообщение ---
    } else if (msg.forward_from || msg.forward_from_chat) {
      caption = msg.caption || msg.text || "Проанализируй пересланное сообщение";

      geminiResponse = await processMessageContent(ctx, msg, caption);

      // --- 3. Обычное сообщение ---
    } else {
      caption = msg.text || msg.caption;
      geminiResponse = await processMessageContent(ctx, msg, caption);
    }

    // --- Ответ пользователю ---
    if (geminiResponse) {
      await safeEdit(ctx, thinkingMsg, geminiResponse);
      addMessage(ctx.chat.id, "user", caption);
      addMessage(ctx.chat.id, "model", geminiResponse);
      logMemory(ctx.chat.id);
    }

  } catch (error) {
    await safeEdit(ctx, thinkingMsg, "Ошибка при обработке сообщения");
    console.error(error);
  }
});


async function processMessageContent(ctx, msg, prompt) {
  if (msg.photo) {
    const photo = msg.photo[msg.photo.length - 1];
    return await handleFile(ctx, photo.file_id, "image/jpeg", handleGeminiImage, prompt);
  }

  if (msg.voice) {
    const prompt = `Прослушай предоставленное голосовое сообщение.
                    Извлеки основную информацию и ключевые моменты.
                    Структурируй ответ в виде краткого резюме.
                    Выдели главные идеи и тезисы.
                    Предоставь краткий ответ в 3-4 предложениях`;
    return await handleFile(ctx, msg.voice.file_id, "audio/ogg", handleGeminiAudio, prompt);
  }

  if (msg.video) {
    return await handleFile(ctx, msg.video.file_id, "video/mp4", handleGeminiVideo, prompt);
  }

  if (msg.video_note) {
    const prompt = `Просмотри предоставленное видео сообщение.
                    Извлеки основную информацию и ключевые моменты.
                    Структурируй ответ в виде краткого резюме.
                    Выдели главные идеи и тезисы.
                    Предоставь краткий ответ в 3-4 предложениях`;
    return await handleFile(ctx, msg.video_note.file_id, "video/mp4", handleGeminiVideo, prompt);
  }

  // if (msg.document) {
  //   return await handleFile(ctx, msg.document.file_id, "application/pdf", handleGeminiDoc, prompt);
  // }

  if (msg.text) {
    console.log(`"${msg.text}" - ${prompt}`);
    return await handleGeminiResponse(`"${msg.text}" - ${prompt}`);
  }

  return "Неизвестный тип сообщения 🤔";
}


async function handleFile(ctx, fileId, mimeType, handlerFn, prompt) {
  const file = await ctx.telegram.getFile(fileId);
  if (file.file_size > 20 * 1024 * 1024) {
    return "❌ Файл больше 20 МБ";
  }

  const fileUrl = await ctx.telegram.getFileLink(fileId);
  const base64 = await fileToBase64(fileUrl);

  return await handlerFn(base64, prompt);
}


// Вспомогательная функция (скачивание файла → base64)
async function fileToBase64(fileUrl) {
  const response = await fetch(fileUrl);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}


// Запускаем бота
bot.launch().catch(err => {
  console.error('Ошибка при запуске бота:', err);
});


// Функция редактирование сообщений
async function safeEdit(ctx, message, newText) {
  try {
    await ctx.telegram.editMessageText(ctx.chat.id, message.message_id, null, newText);
  } catch {
    await ctx.reply(newText); // fallback
  }
}

// Для Docker
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));