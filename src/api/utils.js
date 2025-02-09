// Функция для получения изображения из API
import jsdom from "jsdom";

import logger from "../utils/logger.js";

const { JSDOM } = jsdom;

export async function getImageFromAPI() {
  logger.info("Запрос на загрузку аниме изображения");
  try {
    const response = await fetch('https://api.nekosapi.com/v4/images/random');

    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data[0].url;
  } catch (err) {
    logger.error(`Ошибка при запросе к API:', ${err}`);
    throw err;
  }
}

export function getDataFromDOM(url){
  logger.info("Запрос на парсинг html страницы");
  return JSDOM.fromURL(url)
    .then((dom) => {
      const header = dom.window.document.querySelector(".summary-text").firstElementChild.textContent;
      const elements = dom.window.document.querySelector(".summary-text").lastElementChild.childNodes;
      
      let content = '';
      for (let elem of elements) {
        content += `${elem.textContent}`;
      }
      const result = content.split("•").filter(Boolean).map(item => `● <i>${item.trim()}</i>`).join('\n');
      return `<b>${header}</b>\n\n${result}`;
    })
}