// Функция для получения изображения из API
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

// function getUrlFromMessage(msg) {
//   const urlRegex = /(https?:\/\/)?([\w-]{1,32}\.[\w-]{1,32})[^\s@]*/gm;
//   const found = msg.match(urlRegex);
//   return found ? found[0] : null;
// };

module.exports = { getImageFromAPI };
