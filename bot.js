require('dotenv').config(); // Подключение dotenv для загрузки переменных окружения
const fs = require("fs");
const TelegramBot = require('node-telegram-bot-api');

const handlers = require('./commands/handlers'); // Импорт функций для команд
const patterns = require('./commands/patterns');

// const gemini = require('./helpers/gemini');
// gemini.getAI();

process.env.NTBA_FIX_350 = true;  // Фикс, убирает уведомление о неподдерживаемой функции отправки файлов

// Укажите токен вашего бота
const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(token, { polling: true, interval: 700 });

// Последнее сообщение с url ссылкой
const lastMsg = {
  url: '',
  mesgId: ''
};

try {
  // handlers.handleInformer((data) => bot.sendMessage(chatId, data))
  handlers.handleInformer((value, caption) => bot.sendPhoto(chatId, value, { disable_notification: false, caption: caption}))
} catch(err) {
  console.error('Ошибка вызова информера!');
}

// Меню команд
const menuCommands = [
  {
    command: "img",
    description: "Мне повезёт!"
  },
  {
    command: "300",
    description: "Пересказ статьи по ссылке"
  },
  {
    command: "byn",
    description: "Проверяем курс $€₽"
  },
  {
    command: "temp",
    description: "Погода за окном"
  },
]

bot.setMyCommands(menuCommands);

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

  // console.log(msg);

  patterns.checkMessageAndSendSticker(msg)
    .then(img => {
      if (!img) return;
      const imgStream = fs.createReadStream(img);
      bot.sendSticker(msg.chat.id, imgStream, {
        reply_to_message_id: msg.message_id
      })
        .catch(err => console.log(err))
    })

  const url = await patterns.getUrlFromMessage(msg.text);
  if (url != null) {
    lastMsg.mesgId = msg.message_id;
    lastMsg.url = url;
  }

});

// Обработка ошибок поллинга
bot.on('polling_error', (error) => {
  console.log(error);
});