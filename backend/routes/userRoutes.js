const express = require("express");
const User = require("../models/user");
const router = express.Router();

// Endpoint do pobierania wszystkich użytkowników
router.get("/users", async (req, res) => {
  try {
    // Pobranie wszystkich użytkowników z pliku
    const users = await User.getUsers();

    // Zwrócenie użytkowników jako odpowiedź
    return res.status(200).json(users);
  } catch (error) {
    console.error("Błąd podczas pobierania użytkowników:", error);
    return res
      .status(500)
      .json({ message: "Wystąpił błąd podczas pobierania użytkowników" });
  }
});

// Endpoint do pobierania danych użytkownika po ID
router.get("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Szukamy użytkownika po ID
    const user = await User.findUserById(userId);

    // Sprawdzamy, czy użytkownik istnieje
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    // Zwracamy dane użytkownika
    return res.status(200).json(user);
  } catch (error) {
    console.error("Błąd podczas pobierania danych użytkownika:", error);
    return res
      .status(500)
      .json({ message: "Wystąpił błąd podczas pobierania danych użytkownika" });
  }
});

// Endpoint do aktualizacji zgody na ciasteczka
router.post("/users/:id/consent", async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { consent } = req.body;

  if (consent === undefined) {
    return res.status(400).json({ message: "Brak zgody lub odmowy" });
  }

  try {
    // Szukamy użytkownika po ID
    const user = await User.findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    // Zaktualizuj zgodę na ciasteczka
    user.cookiesConsent = consent;

    // Zapisz zmienionego użytkownika
    const success = await User.updateUser(user);

    if (success) {
      return res.status(200).json({ message: "Zgoda została zaktualizowana" });
    } else {
      return res
        .status(500)
        .json({ message: "Błąd podczas zapisywania danych użytkownika" });
    }
  } catch (error) {
    console.error("Błąd podczas aktualizacji zgody:", error);
    return res
      .status(500)
      .json({ message: "Wystąpił błąd podczas aktualizacji zgody" });
  }
});

// Endpoint do usuwania użytkownika po ID
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Pobranie ID użytkownika z parametrów URL
    const users = await User.getUsers(); // Pobranie wszystkich użytkowników

    // Sprawdzenie, czy użytkownik istnieje
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    // Usunięcie użytkownika z listy
    users.splice(userIndex, 1);

    // Zapisanie zaktualizowanej listy użytkowników
    await User.saveUsers(users);

    return res.status(200).json({ message: "Użytkownik został usunięty" });
  } catch (error) {
    console.error("Błąd podczas usuwania użytkownika:", error);
    return res
      .status(500)
      .json({ message: "Wystąpił błąd podczas usuwania użytkownika" });
  }
});

module.exports = router;
