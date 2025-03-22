const express = require("express");
const router = express.Router();
const Favorites = require("../models/favorites");
const User = require("../models/user");

// Dodawanie kosmetyku do ulubionych
router.post("/favorites", async (req, res) => {
  const { cosmeticId, userId } = req.body;

  if (!cosmeticId || !userId) {
    return res.status(400).json({ message: "Wszystkie pola są wymagane" });
  }
  try {
    const user = await User.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    // Dodajemy kosmetyk do ulubionych
    await Favorites.addFavorite(userId, cosmeticId); // Funkcja do dodawania kosmetyku do ulubionych

    res.status(200).json({ message: "Kosmetyk został dodany do ulubionych" });
  } catch (error) {
    console.error("Błąd podczas dodawania kosmetyku do ulubionych:", error);
    res.status(500).json({
      message: "Wystąpił błąd podczas dodawania kosmetyku do ulubionych",
    });
  }
});

// Pobieranie listy ulubionych kosmetyków
router.get("/favorites", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "Brak ID użytkownika" });
  }

  try {
    const favorites = await Favorites.getFavorites(userId);

    if (!favorites) {
      return res.status(404).json({ message: "Brak ulubionych kosmetyków" });
    }

    res.status(200).json(favorites);
  } catch (error) {
    console.error("Błąd podczas pobierania ulubionych kosmetyków:", error);
    res.status(500).json({
      message: "Wystąpił błąd podczas pobierania ulubionych kosmetyków",
    });
  }
});

// Usuwanie kosmetyku z ulubionych
router.delete("/favorites", async (req, res) => {
  const { userId, cosmeticId } = req.query;

  if (!cosmeticId || !userId) {
    return res
      .status(400)
      .json({ message: "Brak wymaganych danych (cosmeticId lub userId)" });
  }

  try {
    const success = await Favorites.removeFavorite(userId, cosmeticId); // Funkcja do usuwania kosmetyku

    if (!success) {
      return res
        .status(404)
        .json({ message: "Nie znaleziono kosmetyku w ulubionych" });
    }

    res.status(200).json({ message: "Kosmetyk został usunięty z ulubionych" });
  } catch (error) {
    console.error("Błąd podczas usuwania kosmetyku z ulubionych:", error);
    res.status(500).json({
      message: "Wystąpił błąd podczas usuwania kosmetyku z ulubionych",
    });
  }
});

module.exports = router;
