import logger from "../utils/logger.js";
import { getImageFromAPI, getDataFromDOM } from "../api/utils.js";
import { getBcse, toTextOfValues } from "../api/bcse.js";
import { yapi } from "../api/yapi.js";
import { getWeatherNow, getWeatherToday } from "../api/weather.js";
import { scheduleDailyTask } from "../utils/timer.js";
import { getAI, getAiImg, getAiVoice } from "../api/gemini.js";
import { addMessage, getMemory, logMemory, resetMemory } from '../utils/memory.js';

const zapros = process.env.ZAPROS;
const token = process.env.TELEGRAM_TOKEN;

// Обработчик команды /start
export function handleStart(msg) {
  return `Привет, ${msg.from.first_name}! Я твой бот!`;
}

// Обработчик команды /text
export function handleText(msg) {
  return getUrlFromMessage(msg);
}

// Обработчик команды /sticker
export function handleSticker(img) {
  return { type: 'sticker', value: img };
}

// Обработчик команды /gif
export function handleGif() {
  return { type: 'animation', value: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif' };
}

// Обработчик команды /photo
export async function handlePhoto() {
  logger.info("Start handlePhoto");
  try {
    const imageUrl = await getImageFromAPI();
    return { type: 'photo', value: imageUrl, caption: '', has_spoiler: false };
  } catch (error) {
    console.error('Ошибка получения изображения:', error);
    return `Произошла ошибка при получении изображения.\n${error.message.split('\n')[0]}`;
  }
}

export async function handleBcse() {
  logger.info("Start handleBcse");
  try {
    const data = await getBcse();
    return toTextOfValues(data, ['USD', 'EUR', 'RUB'], false)
  } catch (error) {
    console.error(error);
    return `Ошибка.\nДенег нет, но вы держитесь`
  }
}

export async function handleYapi(lastMsg) {
  logger.info("Start handleYapi");
  if (lastMsg.url === '') return 'Отправьте ссылку на статью в чат и повтори запрос';
  return yapi(lastMsg.url)
    // return yapi('https://habr.com/ru/news/729422/')
    .then(json => getDataFromDOM(json.sharing_url))
    .then((data) => {
      const result = { type: 'html', data, mesgId: lastMsg.mesgId }
      lastMsg.mesgId = '';
      lastMsg.url = '';
      return result;
    })
    .catch(err => {
      console.error(err)
      return `Не получилось. ${err}`;
    })
}

export async function handleTemp() {
  return getWeatherNow();
}

export async function handleInformer(botSendMessage) {
  logger.info("Start handleInformer");
  return scheduleDailyTask(async () => {
    console.log("Функция таймера вызвана!");
    const weather = await getWeatherToday();
    const money = await handleBcse();
    const pich = await getImageFromAPI();

    // botSendMessage(value, caption)
    botSendMessage(pich, `${weather}\n${money}\nХорошего дня! 😊`);

  });

}

export async function handleAnalize(botSendMessage, messages) {
  logger.info("Start handleAnalize");
  return scheduleDailyTask(async () => {

    console.log("Функция таймера вызвана!");
    if (messages.length < 10) return

    const last50 = messages.slice(-70);
    const request = `${zapros}: ${last50.map(obj => JSON.stringify(obj)).join(", ")}`;
    console.log(request);
    getAI(request)
      .then(data => {
        botSendMessage(data);
        messages = [];
      })
      .catch(err => console.log(err)
      )
  });

}

async function handleVoice(bot, promt, voice) {
  try {
    const fileId = voice.file_id;
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

    const mimeType = voice.mime_type;

    // Качаем через fetch
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);

    // В Buffer
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString("base64");

    console.log('base64Audio length:', base64Audio.length);
    
    return await getAiVoice(promt, base64Audio, mimeType);

  } catch (error) {
    logger.error('Ошибка при обработке голосового сообщения:', error);
    return 'Произошла ошибка при обработке аудио';
  }

}

export async function handleAiNew(bot, msg) {

  let promt = msg.text.slice(3).trim();
  const chatId = msg.chat.id;

  if (!msg.reply_to_message) {

    console.log('default ai model');    

    if (!promt) {
      promt = "Привет";
    }

    addMessage(chatId, 'user', promt);

    const context = getMemory(chatId);
    const response = await getAI(promt, context);

    addMessage(chatId, 'model', response);
    logMemory(chatId);
    return response;

  } else {  

    const reply = msg.reply_to_message;

    if (reply.voice) {
      
      console.log('audio ai model');

      if (!promt) {
        addMessage(chatId, 'user', 'Сделай транскрибацию');
      } else {
        addMessage(chatId, 'user', promt);
      }

      console.log(reply.voice);
      
      const response = await handleVoice(bot, promt, reply.voice);
      addMessage(chatId, 'model', response);
      logMemory(chatId);
      return response;
    }

  }

}

export async function handleAiImg(msg, img, imgType) {

  const txt = "Дай краткое описание изображения";
  let promt = msg.caption === "/ai" ? txt : msg.caption.replace(/^\/ai\s+/, "").trim();
  if (!promt) {
    promt = txt
  }

  addMessage(chatId, 'user', promt);
  const response = await getAiImg(promt, img, imgType);
  addMessage(chatId, 'model', response);

  return response;
}

export function handleReset(msg) {
  const chatId = msg.chat.id;
  resetMemory(chatId);
  return '🧹 Память очищена. Начнём с чистого листа!';
}