const fs = require("fs").promises;
const path = require("path");

const userFile = path.join(__dirname, "../data/users.json");
const User = require("../models/user");

const saveSkinInfo = async (userId, skinType, skinIssues) => {
  try {
    // Wyszukujemy użytkownika po ID
    const user = await User.findUserById(userId);

    if (!user) {
      console.error(`Użytkownik o ID ${userId} nie istnieje w bazie danych.`);
      return null;
    }

    // Aktualizujemy informacje o skórze w obiekcie użytkownika
    const updatedUser = {
      ...user,
      skinInfo: { skinType, skinIssues },
    };

    // Używamy funkcji updateUser, aby zaktualizować dane w pliku
    const success = await User.updateUser(updatedUser);

    if (success) {
      return updatedUser.skinInfo;
    } else {
      console.error("Błąd podczas aktualizacji informacji o cerze.");
      return null;
    }
  } catch (error) {
    console.error("Błąd podczas zapisywania informacji o cerze:", error);
    throw error; // Rzucamy błąd, aby obsłużyć go wyżej w logice aplikacji
  }
};

const getSkinInfo = async (userId) => {
  try {
    // Szukamy użytkownika po jego ID
    const user = await User.findUserById(userId);
    if (!user) {
      console.error(`Użytkownik o ID ${userId} nie istnieje w bazie danych.`);
      return null;
    }

    return user.skinInfo || null;
  } catch (error) {
    console.error("Błąd podczas pobierania informacji o cerze:", error);
    throw error;
  }
};

module.exports = { saveSkinInfo, getSkinInfo };
