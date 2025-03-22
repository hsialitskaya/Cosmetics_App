const express = require("express");
const router = express.Router();
const Cosmetics = require("../models/cosmetic");

const {
  publishVote,
  countVote,
  publishFav,
  countFav,
} = require("../mqttServer");

// Pobieranie polecanych kosmetykow
router.post("/recommendations", async (req, res) => {
  const { skinType, skinIssues } = req.body;

  if (!skinType || !skinIssues) {
    return res.status(400).json({ message: "Wszystkie pola są wymagane" });
  }

  try {
    const cosmetics = await Cosmetics.getRecommendations(skinType, skinIssues);

    if (cosmetics.length === 0) {
      return res.status(404).json({ message: "Brak polecanych kosmetyków" });
    }

    res.status(200).json(cosmetics);
  } catch (error) {
    console.error("Błąd podczas pobierania polecanych kosmetyków:", error);
    res.status(500).json({ message: "Błąd serwera, spróbuj ponownie później" });
  }
});

// Pobieranie kosmetyków na podstawie wzorca
router.get("/recommendations", async (req, res) => {
  const searchPattern = req.query.pattern;
  if (!searchPattern) {
    console.error("Brak wzorca wyszukiwania w zapytaniu."); // Logowanie błędu, jeśli brak wzorca
    return res.status(400).json({ message: "Brak wzorca wyszukiwania." });
  }

  try {
    const cosmetics = await Cosmetics.searchCosmetics(searchPattern);

    if (cosmetics.length === 0) {
      return res
        .status(200)
        .json({ message: "Brak kosmetyków pasujących do wzorca." });
    }

    res.status(200).json(cosmetics); // Zwracamy kosmetyki
  } catch (error) {
    console.error("Błąd podczas wyszukiwania kosmetyków:", error); // Logowanie błędu serwera
    res
      .status(500)
      .json({ message: "Błąd serwera, spróbuj ponownie później." });
  }
});

// Pobieranie wszystkich kosmetyków
router.get("/cosmetics", async (req, res) => {
  try {
    const cosmetics = await Cosmetics.getCosmetics(); // Pobranie kosmetyków
    return res.status(200).json(cosmetics); // Zwrócenie listy kosmetyków
  } catch (error) {
    console.error("Błąd podczas pobierania kosmetyków:", error);
    return res
      .status(500)
      .json({ message: "Wystąpił błąd podczas pobierania kosmetyków" });
  }
});

// Usuniecia kosmetyków
router.delete("/cosmetics/:id", async (req, res) => {
  try {
    const cosmeticId = parseInt(req.params.id, 10); // Pobranie ID kosmetyku z URL
    const cosmetics = await Cosmetics.getCosmetics(); // Pobranie wszystkich kosmetyków

    // Sprawdzenie, czy kosmetyk istnieje
    const cosmeticIndex = cosmetics.findIndex(
      (cosmetic) => cosmetic.id === cosmeticId
    );
    if (cosmeticIndex === -1) {
      return res.status(404).json({ message: "Kosmetyk nie znaleziony" });
    }

    const deletedCosmetic = cosmetics[cosmeticIndex];
    // Usunięcie kosmetyku z listy
    cosmetics.splice(cosmeticIndex, 1);

    // Zapisanie zaktualizowanej listy kosmetyków
    await Cosmetics.saveCosmetics(cosmetics);

    return res.status(200).json({ message: "Kosmetyk został usunięty" });
  } catch (error) {
    console.error("Błąd podczas usuwania kosmetyku:", error);
    return res
      .status(500)
      .json({ message: "Wystąpił błąd podczas usuwania kosmetyku" });
  }
});

// Funkcja do generowania unikalnego ID na podstawie ostatniego kosmetyku
const generateNewId = (cosmetics) => {
  // Sprawdzamy, czy lista kosmetyków jest pusta
  if (cosmetics.length === 0) {
    return 1;
  }

  // Jeśli lista nie jest pusta, bierzemy ostatni kosmetyk
  const lastCosmetic = cosmetics[cosmetics.length - 1];

  // Zwracamy ID ostatniego kosmetyku + 1
  return lastCosmetic.id + 1;
};

// Endpoint do dodawania kosmetyku
router.post("/cosmetics", async (req, res) => {
  const { name, type, skinType, skinIssues } = req.body;

  // Walidacja danych
  if (!name || !type || !skinType || skinIssues.length === 0) {
    return res
      .status(400)
      .json({ message: "Wszystkie pola muszą być wypełnione" });
  }

  // Pobieranie obecnych kosmetyków z pliku
  const cosmetics = await Cosmetics.getCosmetics();

  // Generowanie nowego ID
  const newId = generateNewId(cosmetics);

  // Tworzenie nowego kosmetyku
  const newCosmetic = {
    id: newId,
    name,
    type,
    skinType,
    skinIssues,
  };

  // Dodanie nowego kosmetyku do listy
  cosmetics.push(newCosmetic);

  // Zapisanie zaktualizowanej listy kosmetyków
  await Cosmetics.saveCosmetics(cosmetics);

  // Wysłanie odpowiedzi
  return res
    .status(201)
    .json({ message: "Kosmetyk został dodany", cosmetic: newCosmetic });
});

// Endpoint do głosowania na kosmetyk
router.post("/cosmetics/:id/vote", async (req, res) => {
  const cosmeticId = parseInt(req.params.id, 10); // Pobieramy ID kosmetyka z URL
  const { voteType } = req.body; // Pobieramy typ głosu (up/down)

  if (voteType !== "up" && voteType !== "down") {
    return res.status(400).json({ message: "Nieprawidłowy typ głosu" });
  }

  try {
    // Pobranie obecnych kosmetyków z pliku
    const cosmetics = await Cosmetics.getCosmetics();

    // Szukamy kosmetyka o danym ID
    const cosmeticIndex = cosmetics.findIndex(
      (cosmetic) => cosmetic.id === cosmeticId
    );

    if (cosmeticIndex === -1) {
      return res.status(404).json({ message: "Kosmetyk nie znaleziony" });
    }

    const cosmetic = cosmetics[cosmeticIndex];

    // Dodajemy głos
    if (voteType === "up") {
      cosmetic.upVotes = (cosmetic.upVotes || 0) + 1; // Dodajemy głos pozytywny
    } else if (voteType === "down") {
      cosmetic.downVotes = (cosmetic.downVotes || 0) + 1; // Dodajemy głos negatywny
    }

    // Zapisujemy zaktualizowaną listę kosmetyków
    await Cosmetics.saveCosmetics(cosmetics);

    // Publikowanie głosu na brokerze MQTT
    await publishVote(cosmetic, voteType);

    // Oczekiwanie na wynik głosowania z MQTT
    const votes = await countVote();

    // Zwracamy odpowiedź z wynikiem głosowania
    res.status(200).json({
      message: `Głos został dodany: ${
        voteType === "up" ? "Pozytywny" : "Negatywny"
      }`,
      cosmetic: cosmetic,
      votes,
    });
  } catch (error) {
    console.error("Błąd podczas głosowania na kosmetyk:", error);
    res.status(500).json({ message: "Błąd serwera podczas głosowania" });
  }
});

// Endpoint do podierania liczby ulubionych
router.post("/cosmetics/fav", async (req, res) => {
  const { cosmetics } = req.body;

  if (!Array.isArray(cosmetics)) {
    return res.status(400).json({ message: "Nieprawidłowe dane" });
  }

  try {
    await publishFav(cosmetics);
    const amount = await countFav();

    res.status(200).json({ amount });
  } catch (error) {
    console.error("Błąd podczas głosowania na kosmetyk:", error);
    res.status(500).json({ message: "Błąd serwera podczas głosowania" });
  }
});

module.exports = router;
