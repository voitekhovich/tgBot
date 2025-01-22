const { getUrlFromMessage } = require('../helpers/utils');

async function checkMessageAndSendSticker(msg) {
  const patterns = [
    { regex: /^\s*[hnн]\s?[eе]\s?[tт][ьъ]?\s*[.,!:=()Dd]*\s*$/i, image: './images/goose-pdr.png' },
    { regex: /^\s*[д]\s?[аa]\s*[.,!:=()Dd]*\s*$/i, image: './images/pizda.png' },
    { regex: /семь[я|ёй|е]|семейный/i, image: './images/family.png' },
    { regex: /рофлю/i, image: './images/rofl.png' },
    { regex: /блудный сын вернулся/i, image: './images/luntik.png' },
    { regex: /^(привет|здарова|дарова|здароу|здрасьте|хэлоу|приветик)(\s+\S+)?$/i, image: './images/hello.png' }
  ];

  // Ищем совпадение среди всех паттернов
  const match = patterns.find(pattern => pattern.regex.test(msg.text));

  // Если найдено совпадение, устанавливаем соответствующую картинку
  if (match) {
    return match.image
  } else {
    return
  }
}

// async function checkMessageOnUrl(msg) {
//   const url = await getUrlFromMessage(msg.text);
//   if (url != null) {
//     return {mesgId: msg.message_id, url: url}
//   }
// }

// Экспорт функций
module.exports = {
  checkMessageAndSendSticker,
  // checkMessageOnUrl
};