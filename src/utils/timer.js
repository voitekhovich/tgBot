export function scheduleDailyTask(taskFunction) {
  function setNextTimeout() {
    const now = new Date();
    const nextRun = new Date();
    
    nextRun.setHours(9, 0, 0, 0); // Устанавливаем время на 9:00
    
    if (now > nextRun) {
      nextRun.setDate(nextRun.getDate() + 1); // Если время уже прошло, назначаем на следующий день
    }

    const delay = nextRun - now;
    
    setTimeout(() => {
      taskFunction();
      setNextTimeout(); // Перезапускаем таймер на следующий день
    }, delay);
  }

  setNextTimeout();
}

// Пример использования
scheduleDailyTask(() => {
  const now = new Date();
  console.log(`Функция вызвана в ${now}`);
});