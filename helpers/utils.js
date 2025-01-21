// async function getImageFromAPI() {
//   try {
//     const response = await fetch('https://nekos.best/api/v2/neko');
//     const data = await response.json();
//     return data.results[0].url;
//   } catch (error) {
//     console.error('Ошибка при запросе к API:', error);
//     throw error;
//   }
// }

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

function getUrlFromMessage(message) {
  const urlRegex = /(https?:\/\/)?([\w-]{1,32}\.[\w-]{1,32})[^\s@]*/gm;
  const found = message.match(urlRegex);
  return found ? found[0] : null;
};

module.exports = { getUrlFromMessage, getImageFromAPI };
