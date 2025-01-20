async function getImageFromAPI() {
  try {
    const response = await fetch('https://nekos.best/api/v2/neko');
    const data = await response.json();
    return data.results[0].url;
  } catch (error) {
    console.error('Ошибка при запросе к API:', error);
    throw error;
  }
}

module.exports = { getImageFromAPI };
