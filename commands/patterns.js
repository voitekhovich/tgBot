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

function getUrlFromMessage(msg) {
  if (typeof msg !== 'string') {
    return null;
  }

  const urlRegex = /(https?:\/\/)?([\w-]{1,32}\.[\w-]{1,32})[^\s@]*/gm;
  const found = msg.match(urlRegex);
  return found ? found[0] : null;
}

// Экспорт функций
module.exports = {
  checkMessageAndSendSticker,
  getUrlFromMessage
};