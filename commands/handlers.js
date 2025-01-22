const { getImageFromAPI, getUrlFromMessage } = require('../helpers/utils');
const { getBcse, toTextOfValues } = require('../helpers/bcse');
// const { yapi } = require('../helpers/yapi');

// const YA_300_TOKEN = process.env.YA_300_TOKEN;

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
    return { type: 'photo', value: imageUrl, caption: '', has_spoiler: true };
  } catch (error) {
    console.error('Ошибка получения изображения:', error);
    return `Произошла ошибка при получении изображения.\n${error.message.split('\n')[0]}`;
  }
}

async function handleBcse() {
  try {
    const data = await getBcse();
    return toTextOfValues(data, ['USD','EUR','RUB'], false)
  } catch (error) {
    console.error(error);
    return `Ошибка.\nДенег нет, но вы держитесь`
  }
}

// async function handleYapi(msg) {
//   const url = getUrlFromMessage(msg);

//    if (url === '') return 'Отправьте ссылку на статью в чат и повторите запрос';

//    // const last_url = 'https://habr.com/ru/articles/822121';
 
//    const msgWait = await sendMsg('Отправляю ссылку ФСБ-шникам...', msg, true, lastMsg.mesgId)
//    // console.log(msgWait);
 
//    yapi(YA_300_TOKEN, lastMsg.url)
//      .then(json => {
//        editMsg('Ответ получен, осталось обработать...', msgWait)
//        return json
//      })
//      .then(json => func.getDataFromDOM(json.sharing_url))
//      .then(data => editMsg(data, msgWait, true))
//      .then(() => {
//        lastMsg.mesgId = '';
//        lastMsg.url = ''
//      })
//      .catch(err => {
//        console.log(err)
//        editMsg('ФСБ-шники не ответили :(', msgWait)
//      })
// }

// Экспорт функций
module.exports = {
  handleStart,
  handleText,
  handleSticker,
  handleGif,
  handlePhoto,
  handleBcse,
  // handleYapi
};