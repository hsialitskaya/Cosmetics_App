const fs = require("fs").promises;
const path = require("path");

const usersFile = path.join(__dirname, "../data/admin.json");

// Funkcja do odczytu danych z pliku z obsługą błędów
const getAdmins = async () => {
  try {
    const data = await fs.readFile(usersFile, "utf-8");
    return JSON.parse(data); // Zwraca tablicę administratorów
  } catch (error) {
    console.error("Błąd podczas odczytu pliku użytkowników:", error);
    return [];
  }
};

module.exports = {
  getAdmins,
};
