require('dotenv').config(); // Подключение dotenv для загрузки переменных окружения
const fs = require("fs");
const TelegramBot = require('node-telegram-bot-api');
const handlers = require('./commands/handlers'); // Импорт функций для команд
const checkMessage = require('./commands/patterns');

// Укажите токен вашего бота
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true, interval: 500 });

// Меню команд
const menuCommands = [
  {
      command: "img",
      description: "Получить аниме картинку"
  },
]

bot.setMyCommands(menuCommands);

// Маппинг команд: команда => обработчик
const commands = {
  '/start': handlers.handleStart,
  '/text': handlers.handleText,
  '/sticker': handlers.handleSticker,
  '/gif': handlers.handleGif,
  '/img': handlers.handlePhoto,
};

// Функция для обработки команд
const handleCommand = async (command, msg) => {
  const handler = commands[command];
  if (!handler) {
    bot.sendMessage(msg.chat.id, 'Извините, я не знаю такой команды.');
    return;
  }

  const result = await handler(msg);

  // Маппинг действий по типу
  const actions = {
    sticker: () => bot.sendSticker(msg.chat.id, result.value),
    photo: () => bot.sendPhoto(msg.chat.id, result.value, { caption: result.caption, has_spoiler: result.has_spoiler }),
    animation: () => bot.sendAnimation(msg.chat.id, result.value),
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
bot.on('message', (msg) => {
  checkMessage.checkMessageAndSendSticker(msg)
  .then(img => {
    // console.log(img);
    if (!img) return;
    const imgStream = fs.createReadStream(img);
    bot.sendSticker(msg.chat.id, imgStream, {
      reply_to_message_id: msg.message_id
    })
    .catch(err => console.log(err));
  })

  // if (!msg.text.startsWith('/')) {
  //   bot.sendMessage(msg.chat.id, 'Извините, я понимаю только команды.');
  // }

});