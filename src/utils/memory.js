const memories = new Map(); // ключ — chatId, значение — массив сообщений

function cleanOldMessages(chatId) {
  const memory = memories.get(chatId) || [];
  const cutoff = Date.now() - 15 * 60 * 1000;
  const filtered = memory.filter(m => m.timestamp >= cutoff);
  memories.set(chatId, filtered);
}

export function addMessage(chatId, role, text) {
  const memory = memories.get(chatId) || [];
  memory.push({ timestamp: Date.now(), role, text });
  memories.set(chatId, memory);
  cleanOldMessages(chatId);
}

export function getMemory(chatId) {
  cleanOldMessages(chatId);
  const memory = memories.get(chatId) || [];
  return memory.map(m => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));
}

export function logMemory(chatId) {
  const memory = memories.get(chatId) || [];
  console.log(`🧠 Память для чата ${chatId}:`);
  memory.forEach((m, i) => {
    const time = new Date(m.timestamp).toLocaleTimeString();
    console.log(`[${i}] [${time}] ${m.role}: ${m.text}`);
  });
}

export function resetMemory(chatId) {
  memories.set(chatId, []);
  console.log(`🧹 Память для чата ${chatId} очищена`);
}
