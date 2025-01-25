// Функция для получения изображения из API
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function getImageFromAPI() {
  try {
    const response = await fetch('https://api.nekosapi.com/v4/images/random');

    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data[0].url;
  } catch (error) {
    console.error('Ошибка при запросе к API:', error);
    throw error;
  }
}

function getDataFromDOM(url){
  return JSDOM.fromURL(url)
    .then((dom) => {
      const header = dom.window.document.querySelector(".summary-text").firstElementChild.textContent;
      const elements = dom.window.document.querySelector(".summary-text").lastElementChild.childNodes;
      
      let content = '';
      for (let elem of elements) {
        content += `${elem.textContent}`;
      }
      const result = content.split("●").filter(Boolean).map(item => `• <i>${item.trim()}</i>`).join('\n');
      return `<b>${header}</b>\n\n${result}`;
    })
}

module.exports = { getImageFromAPI, getDataFromDOM };
