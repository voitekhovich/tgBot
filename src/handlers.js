import { getImageFromAPI } from "./api/nekosapi.js";
import { yapi } from "./api/yapi.js";
import { getDataFromDOM } from "./utils/utils.js";
import logger from "./utils/logger.js";

export async function handleNekosApi(ctx) {
  logger.info("Start handleNekosApi");
  try {
    // Отправляем сообщение "Размышляю..."
    const thinkingMessage = await ctx.reply('Загружаю...');

    // Запрашиваем ссылку на изображение через API
    const imageUrl = await getImageFromAPI();


    // Проверяем, получена ли ссылка на изображение
    if (!imageUrl) {
      throw new Error('Ссылка на изображение не получена');
    }

    // Отправляем изображение
    await ctx.replyWithPhoto({ url: imageUrl });

    // Удаляем сообщение "Размышляю..."
    await ctx.telegram.deleteMessage(ctx.chat.id, thinkingMessage.message_id);

  } catch (error) {
    console.error('Ошибка:', error);
    // Если что-то пошло не так, редактируем сообщение "Размышляю..." на сообщение об ошибке
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      thinkingMessage.message_id,
      null,
      'Произошла ошибка при получении изображения'
    );
  }
}

export async function handleYapi(url) {
  logger.info("Start handleYapi");
  console.log(url);
  
  try {
    if (url === '') return 'Отправьте ссылку на статью в чат и повтори запрос';
    const result = await yapi(url)
    const data = await getDataFromDOM(result.sharing_url)
    await ctx.reply(data, { parse_mode: 'HTML' });
  } catch (error) {
    console.error(error);
  }
}