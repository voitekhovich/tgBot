process.env.NTBA_FIX_350 = true;  // Фикс, убирает уведомление о неподдерживаемой функции отправки файлов

import 'dotenv/config';

import fs from "fs";
import TelegramBot from "node-telegram-bot-api";

import logger from "./utils/logger.js";
import { menuCommands } from "./config/commands.js";
import { getMessages } from "./utils/functions.js";
import * as handlers from "./commands/handlers.js";
import * as patterns from "./commands/patterns.js";

logger.info("Сервер запущен")

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true, interval: 700 });
bot.setMyCommands(menuCommands);

const chatId = process.env.CHAT_ID;

logger.info("Бот запущен");

// Последнее сообщение с url ссылкой
const lastMsg = {
  url: '',
  mesgId: ''
};

const messageBuf = [];

try {
  handlers.handleInformer((value, caption) => bot.sendPhoto(chatId, value, { disable_notification: false, caption: caption }))
  handlers.handleAnalize((value) => bot.sendMessage(chatId, value, { disable_notification: false }), messageBuf)
} catch (error) {
  logger.error(`Ошибка вызова информера! ${error}`);
}

// Маппинг команд: команда => обработчик
const commands = {
  '/img': handlers.handlePhoto,
  '/byn': handlers.handleBcse,
  '/300': (msg) => handlers.handleYapi(lastMsg),
  '/temp': handlers.handleTemp,
  '/ai': (msg) => handlers.handleAi(msg.text),
};

// Функция для обработки команд
const handleCommand = async (command, msg) => {
  const handler = commands[command];
  if (!handler) return;
  const result = await handler(msg);
  // Маппинг действий по типу
  const actions = {
    sticker: () => bot.sendSticker(msg.chat.id, result.value),
    photo: () => bot.sendPhoto(msg.chat.id, result.value, { caption: result.caption, has_spoiler: result.has_spoiler }),
    animation: () => bot.sendAnimation(msg.chat.id, result.value),
    html: () => bot.sendMessage(msg.chat.id, result.data, { parse_mode: "HTML", reply_to_message_id: result.msgId }),
    default: () => bot.sendMessage(msg.chat.id, result || 'Команда обработана.'),
  };
  // Выполнение действия на основе типа или действия по умолчанию
  (actions[result?.type] || actions.default)();
};

// Обработчик всех команд
bot.onText(/\/\w+/, (msg, match) => {
  const command = match[0]; // Извлекаем команду из текста
  handleCommand(command, msg);
});

// Обработка всех остальных сообщений
bot.on('message', async (msg) => {
  getMessages(msg, messageBuf)
  patterns.checkMessageAndSendSticker(msg)
    .then(img => {
      if (!img) return;
      const imgStream = fs.createReadStream(img);
      bot.sendSticker(msg.chat.id, imgStream, {
        reply_to_message_id: msg.message_id
      })
        .catch(err => logger.error(`${err}`))
    })
  const url = await patterns.getUrlFromMessage(msg.text);
  if (url != null) {
    lastMsg.mesgId = msg.message_id;
    lastMsg.url = url;
  }
});

bot.on('polling_error', (err) => {
  logger.error(`Ошибка поллинга: ${err}`);

  if (err.code === 'EFATAL') {
    logger.error("Критическая ошибка! Перезапускаем бота...");
    process.exit(1);
  }
});