const fs = require("fs").promises;
const path = require("path");

const cosmeticsFile = path.join(__dirname, "../data/cosmetics.json");

const getCosmetics = async () => {
  try {
    const data = await fs.readFile(cosmeticsFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Błąd podczas odczytu pliku użytkowników:", error);
    return [];
  }
};

const getRecommendations = async (skinType, skinIssues) => {
  try {
    const cosmetics = await getCosmetics(); // Załóżmy, że getCosmetics to funkcja, która pobiera dane kosmetyków

    // Sprawdzamy, czy cosmetics jest tablicą
    if (!Array.isArray(cosmetics)) {
      throw new Error(
        "Błąd: Otrzymano niewłaściwe dane. Oczekiwano tablicy kosmetyków."
      );
    }

    const filteredCosmetics = cosmetics.filter((cosmetic) => {
      // Dopasowanie typu skóry
      const matchesSkinType = cosmetic.skinType.includes(skinType);

      // Dopasowanie problemów skórnych (przynajmniej jeden musi pasować)
      const matchesSkinIssues = skinIssues.some((issue) =>
        cosmetic.skinIssues.includes(issue)
      );

      return matchesSkinType && matchesSkinIssues;
    });

    return filteredCosmetics; // Zwróć przefiltrowane kosmetyki
  } catch (error) {
    console.error("Błąd podczas pobierania rekomendacji kosmetyków:", error);
    throw error;
  }
};

const findCosmeticById = async (cosmeticId) => {
  try {
    const cosmetics = await getCosmetics();

    // Sprawdzamy, czy cosmetics jest tablicą
    if (!Array.isArray(cosmetics)) {
      throw new Error(
        "Błąd: Otrzymano niewłaściwe dane. Oczekiwano tablicy kosmetyków."
      );
    }

    const cosmetic = cosmetics.find((cosmetic) => cosmetic.id === cosmeticId);

    if (!cosmetic) {
      throw new Error(`Kosmetyk o ID ${cosmeticId} nie został znaleziony.`);
    }

    return cosmetic;

    // Zwróć kosmetyk, jeśli znaleziono
  } catch (error) {
    console.error(
      `Błąd podczas wyszukiwania kosmetyku o ID ${cosmeticId}:`,
      error
    );
    return null;
  }
};

// Funkcja wyszukiwania kosmetyków na podstawie wzorca
const searchCosmetics = async (pattern) => {
  try {
    const cosmetics = await getCosmetics(); // Pobierz dane kosmetyków

    // Sprawdzamy, czy cosmetics jest tablicą
    if (!Array.isArray(cosmetics)) {
      throw new Error(
        "Błąd: Otrzymano niewłaściwe dane. Oczekiwano tablicy kosmetyków."
      );
    }

    // Filtrujemy kosmetyki na podstawie wzorca w nazwie
    const matchedCosmetics = cosmetics.filter((cosmetic) => {
      return cosmetic.name.toLowerCase().includes(pattern.toLowerCase()); // Wyszukiwanie bez uwzględnienia wielkości liter
    });

    return matchedCosmetics; // Zwracamy kosmetyki pasujące do wzorca
  } catch (error) {
    console.error("Błąd podczas wyszukiwania kosmetyków:", error);
    throw error;
  }
};

// Funkcja do zapisu danych kosmetykow z obsługą błędów
const saveCosmetics = async (cosmetics) => {
  try {
    await fs.writeFile(
      cosmeticsFile,
      JSON.stringify(cosmetics, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Błąd podczas zapisu pliku kosmetyków:", error);
  }
};

module.exports = {
  getCosmetics,
  getRecommendations,
  findCosmeticById,
  searchCosmetics,
  saveCosmetics,
};
