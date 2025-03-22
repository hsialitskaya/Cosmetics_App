const fs = require("fs");
const winston = require("winston");
const { format } = winston;
const moment = require("moment");

// Usuń plik logów przy każdym uruchomieniu
const logFilePath = "../logs/app.log";

if (fs.existsSync(logFilePath)) {
  fs.unlinkSync(logFilePath); // Usuwamy plik logów, jeśli istnieje
}

const logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: () => moment().format("DD-MM-YYYY HH:mm:ss"), // Ustawienie własnego formatu daty
    }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [new winston.transports.File({ filename: logFilePath })],
});

module.exports = logger;
