import logger from "../utils/logger.js";

export function getMessages(msg, messageBuf) {
  try {
    if (msg.from.is_bot === true) return
    if (!msg.text || msg.text.startsWith("/")) return
    // if (msg.chat.id !== chatId) return

    const message = { username: msg.from.username, text: msg.text }
    messageBuf.push(message);
    logger.info(JSON.stringify(message));
  } catch (err) {
    logger.error(`${err}`);
  }
}

// export async function getImg(msg) {
//   // console.log(msg);
  
//   try {
//     // Получаем информацию о фото
//     const photo = msg.photo[msg.photo.length - 1];
//     const fileId = photo.file_id;

//     const file = await bot.getFile(fileId);
//     const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

//     // console.log(file);    

//       // Качаем через fetch
//     const res = await fetch(fileUrl);
//     if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
    
//     // В Buffer
//     const arrayBuffer = await res.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     return buffer.toString("base64");

//     // console.log(file);

//     // Теперь buffer содержит изображение в памяти
//     // Вы можете работать с ним как с обычным буфером
    
//     // Пример: отправить это же изображение обратно
//     // await bot.sendPhoto(msg.chat.id, Buffer.from(arrayBuffer));
      
//   } catch (error) {
//     logger.error('Ошибка при загрузке фото:', error);
//   }

// }