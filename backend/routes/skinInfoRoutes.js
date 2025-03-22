const express = require("express");
const router = express.Router();
const User = require("../models/user");
const skinInfo = require("../models/skinInfo");

const { publishSkinData, fetchSkinLinks } = require("../mqttServer");

// Endpoint do zapisu danych o cerze
router.post("/skin", async (req, res) => {
  const { skinType, skinIssues, userId } = req.body;

  if (!skinType || !skinIssues) {
    console.error("Błąd: Brak wymaganych danych (skinType lub skinIssues)");
    return res.status(400).json({ message: "Wszystkie pola są wymagane" });
  }

  const user = await User.findUserById(userId);
  if (!user) {
    console.error(`Błąd: Użytkownik o ID ${userId} nie znaleziony`);
    return res.status(404).json({ message: "Użytkownik nie znaleziony" });
  }

  await skinInfo.saveSkinInfo(userId, skinType, skinIssues);

  res.status(200).json({ message: "Dane o cerze zostały zapisane" });
});

// Endpoint do pobrania danych o skórze użytkownika
router.get("/skin", async (req, res) => {
  const { userId } = req.query; // Pobranie userId z query

  if (!userId) {
    return res.status(400).json({ message: "Brak parametru userId" });
  }

  try {
    // Sprawdzanie, czy użytkownik istnieje
    const user = await User.findUserById(userId);
    if (!user) {
      console.error(`Błąd: Użytkownik o ID ${userId} nie znaleziony`);
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    // Pobranie danych o cerze użytkownika
    const skinData = await skinInfo.getSkinInfo(userId);
    if (!skinData) {
      console.error("Brak danych o cerze dla użytkownika:", userId);
      return res.status(404).json({ message: "Brak danych o cerze" });
    }

    // Publikowanie danych na brokerze MQTT
    await publishSkinData(skinData);

    // Oczekiwanie na odpowiedź z linkami
    const info = await fetchSkinLinks();

    res.status(200).json({ skinData, info });
  } catch (error) {
    console.error("Błąd podczas pobierania danych o cerze:", error);
    res.status(500).json({ message: "Błąd serwera, spróbuj ponownie później" });
  }
});

module.exports = router;
