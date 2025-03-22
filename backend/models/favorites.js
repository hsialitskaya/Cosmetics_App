const fs = require("fs").promises;
const path = require("path");
const User = require("../models/user");
const Cosmetic = require("../models/cosmetic");

const addFavorite = async (userId, cosmeticId) => {
  try {
    // Wyszukujemy użytkownika po ID
    const user = await User.findUserById(userId);

    if (!user) {
      console.error(`Użytkownik o ID ${userId} nie istnieje w bazie danych.`);
      return null;
    }

    if (!user.favorites) {
      user.favorites = []; // Inicjalizuj favorites, jeśli nie istnieje
    }

    // Dodajemy kosmetyk do listy ulubionych (jeśli jeszcze go nie ma)
    if (!user.favorites.includes(cosmeticId)) {
      user.favorites.push(cosmeticId);
    } else {
      console.log(`Kosmetyk o ID ${cosmeticId} jest już na liście ulubionych.`);
    }

    // Używamy funkcji updateUser, aby zaktualizować dane w pliku
    const success = await User.updateUser(user);

    if (success) {
      console.log(`Kosmetyk o ID ${cosmeticId} został dodany do ulubionych.`);
      return user.favorites; // Zwracamy zaktualizowaną listę ulubionych
    } else {
      console.error("Błąd podczas aktualizacji informacji o produktach.");
      return null;
    }
  } catch (error) {
    console.error("Błąd podczas zapisywania informacji o produktach:", error);
    throw error;
  }
};

const getFavorites = async (userId) => {
  try {
    // Pobieramy użytkownika z bazy danych
    const user = await User.findUserById(userId);

    if (!user) {
      console.error(`Użytkownik o ID ${userId} nie istnieje w bazie danych.`);
      return null;
    }

    // Jeśli użytkownik ma ulubione kosmetyki, pobieramy ich nazwy
    if (user.favorites && user.favorites.length > 0) {
      // Pobierz szczegóły kosmetyków na podstawie ich ID
      const favoriteCosmetics = await Promise.all(
        user.favorites.map(async (cosmeticId) => {
          const cosmetic = await Cosmetic.findCosmeticById(cosmeticId); // Funkcja do znalezienia kosmetyku po ID

          if (cosmetic) {
            return cosmetic;
          }
          return null;
        })
      );

      return favoriteCosmetics;
    }

    return []; // Jeśli brak ulubionych kosmetyków
  } catch (error) {
    console.error("Błąd podczas pobierania informacji o kosmetykach:", error);
    throw error;
  }
};

const removeFavorite = async (userId, cosmeticId) => {
  if (!userId) {
    console.error("Brak userId przy próbie usunięcia kosmetyku");
    return null;
  }

  try {
    // Pobieramy aktualnych użytkowników
    const user = await User.findUserById(userId);
    console.log(user);

    if (!user) {
      console.error(`Użytkownik o ID ${userId} nie istnieje w bazie danych.`);
      return null;
    }

    // Sprawdzamy, czy kosmetyk o danym ID jest w ulubionych
    const favoriteIndex = user.favorites.indexOf(Number(cosmeticId));

    if (favoriteIndex === -1) {
      console.log(
        `Kosmetyk o ID ${cosmeticId} nie znajduje się na liście ulubionych.`
      );
      return user.favorites; // Zwracamy listę bez zmian
    }

    // Usuwamy kosmetyk z listy ulubionych
    user.favorites.splice(favoriteIndex, 1);

    // Zapisujemy zaktualizowaną listę użytkownika
    const updateSuccess = await User.updateUser(user);

    if (updateSuccess) {
      console.log(`Kosmetyk o ID ${cosmeticId} został usunięty z ulubionych.`);
    } else {
      console.error("Nie udało się zaktualizować użytkownika.");
    }

    // Zwracamy zaktualizowaną listę ulubionych
    return user.favorites;
  } catch (error) {
    console.error("Błąd podczas usuwania kosmetyku z ulubionych:", error);
    throw error;
  }
};

module.exports = { addFavorite, getFavorites, removeFavorite };
