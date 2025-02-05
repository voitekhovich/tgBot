const { getImageFromAPI, getDataFromDOM } = require('../helpers/utils');
const { getBcse, toTextOfValues } = require('../helpers/bcse');
const { yapi } = require('../helpers/yapi');
const { getWeatherNow, getWeatherToday } = require('../helpers/weather');
const { scheduleDailyTask } = require('../helpers/timer');

// Обработчик команды /start
function handleStart(msg) {
  return `Привет, ${msg.from.first_name}! Я твой бот!`;
}

// Обработчик команды /text
function handleText(msg) {
  return getUrlFromMessage(msg);
}

// Обработчик команды /sticker
function handleSticker(img) {
  return { type: 'sticker', value: img };
}

// Обработчик команды /gif
function handleGif() {
  return { type: 'animation', value: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif' };
}

// Обработчик команды /photo
async function handlePhoto() {
  try {
    const imageUrl = await getImageFromAPI();
    return { type: 'photo', value: imageUrl, caption: '', has_spoiler: false };
  } catch (error) {
    console.error('Ошибка получения изображения:', error);
    return `Произошла ошибка при получении изображения.\n${error.message.split('\n')[0]}`;
  }
}

async function handleBcse() {
  try {
    const data = await getBcse();
    return toTextOfValues(data, ['USD', 'EUR', 'RUB'], false)
  } catch (error) {
    console.error(error);
    return `Ошибка.\nДенег нет, но вы держитесь`
  }
}

async function handleYapi(lastMsg) {
  if (lastMsg.url === '') return 'Отправьте ссылку на статью в чат и повтори запрос';
  return yapi(lastMsg.url)
  // return yapi('https://habr.com/ru/news/729422/')
    .then(json => getDataFromDOM(json.sharing_url))
    .then((data) => {
      const result = {type: 'html', data, mesgId: lastMsg.mesgId}
      lastMsg.mesgId = '';
      lastMsg.url = '';
      return result;
    })
    .catch(err => {
      console.error(err)
      return `Не получилось. ${err}`;
    })
}

async function handleTemp() {
  return getWeatherNow();
}

async function handleInformer(botSendMessage) {
  
  return scheduleDailyTask(async () => {
    console.log("Функция таймера вызвана!");
    const weather = await getWeatherToday();
    const money = await handleBcse();
    const pich = await getImageFromAPI();

    // botSendMessage(value, caption)
    botSendMessage(pich, `${weather}\n${money}\nХорошего дня! 😊`);

  });
  
}

// Экспорт функций
module.exports = {
  handleStart,
  handleText,
  handleSticker,
  handleGif,
  handlePhoto,
  handleBcse,
  handleYapi,
  handleTemp,
  handleInformer
};