// Функция для получения изображения из API
import logger from "../utils/logger.js";

const NIKOSAPI_URL = "https://api.nekosapi.com/v4/images/random";

export async function getImageFromAPI() {
  logger.info("Запрос на загрузку аниме изображения");
  try {
    const response = await fetch(NIKOSAPI_URL);

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