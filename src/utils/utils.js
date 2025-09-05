import jsdom from "jsdom";
import logger from "../utils/logger.js";

const { JSDOM } = jsdom;

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