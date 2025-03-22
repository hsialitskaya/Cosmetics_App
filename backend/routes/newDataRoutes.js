const express = require("express");
const User = require("../models/user");
const Skin = require("../models/skinInfo");
const bcrypt = require("bcrypt");
const router = express.Router();

// Aktualizacja danych użytkownika
router.put("/updateUser", async (req, res) => {
  const { userId, updates } = req.body;

  try {
    // Sprawdzenie, czy użytkownik istnieje
    const user = await User.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie istnieje" });
    }

    // Sprawdzenie, czy dane są obecne
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Brak danych do aktualizacji" });
    }

    // Aktualizacja danych użytkownika
    if (updates.firstName) user.firstName = updates.firstName;
    if (updates.lastName) user.lastName = updates.lastName;
    if (updates.age) user.age = updates.age;
    if (updates.email) user.email = updates.email;

    if (updates.password) {
      user.password = await bcrypt.hash(updates.password, 10);
    }

    await User.updateUser(user);
    res
      .status(200)
      .json({ message: "Dane użytkownika zostały zaktualizowane" });
  } catch (error) {
    console.error("Błąd aktualizacji użytkownika:", error.message);
    res.status(500).json({ message: "Błąd aktualizacji danych użytkownika" });
  }
});

// Aktualizacja danych użytkownika o cerze
router.put("/updateSkin", async (req, res) => {
  const { userId, updates } = req.body;

  try {
    // Sprawdzenie, czy użytkownik istnieje
    const user = await User.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie istnieje" });
    }

    // Sprawdzenie, czy dane są obecne
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Brak danych do aktualizacji" });
    }

    // Aktualizacja danych użytkownika
    await Skin.saveSkinInfo(userId, updates.skinType, [
      ...new Set(updates.skinIssues),
    ]);
    res
      .status(200)
      .json({ message: "Dane użytkownika o cerze zostały zaktualizowane" });
  } catch (error) {
    console.error("Błąd aktualizacji informacji o cerze:", error.message);
    res.status(500).json({ message: "Błąd aktualizacji informacji o cerze" });
  }
});

module.exports = router;
