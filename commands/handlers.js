const { getImageFromAPI, getUrlFromMessage } = require('../helpers/utils'); // Импорт вспомогательных функций

// Обработчик команды /start
function handleStart(msg) {
  return `Привет, ${msg.from.first_name}! Я твой бот!`;
}

// Обработчик команды /text
function handleText(msg) {
  return getUrlFromMessage(msg);
}

// Обработчик команды /sticker
function handleSticker() {
  return { type: 'sticker', value: 'https://tlgrm.ru/_/stickers/a5f/f5c/a5ff5c50-d8f5-49eb-b8be-d7f104fd7ad1/7.webp' };
}

// Обработчик команды /gif
function handleGif() {
  return { type: 'animation', value: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif' };
}

// Обработчик команды /photo
async function handlePhoto() {
  try {
    const imageUrl = await getImageFromAPI();
    return { type: 'photo', value: imageUrl, caption: '', has_spoiler: true };
  } catch (error) {
    console.error('Ошибка получения изображения:', error);
    return `Произошла ошибка при получении изображения.\n${error.message.split('\n')[0]}`;
  }
}

// Экспорт функций
module.exports = {
  handleStart,
  handleText,
  handleSticker,
  handleGif,
  handlePhoto,
};