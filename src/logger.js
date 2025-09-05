import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY.MM.DD HH:mm:ss Z' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${level.toUpperCase()}] ${timestamp}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Вывод в консоль
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), // Ошибки в файл
    new winston.transports.File({ filename: "logs/combined.log" }) // Все логи в файл
  ]
});

export default logger;