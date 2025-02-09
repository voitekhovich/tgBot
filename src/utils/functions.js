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