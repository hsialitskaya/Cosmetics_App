// Funkcja do aktualizacji danych o cerze
const updateSkinData = async (userId, updates) => {
  console.log("Aktualizacja danych użytkownika:", updates);
  try {
    const response = await fetch(`${API_URL}/updateSkin`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, updates }),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      throw new Error(
        responseBody.message || "Błąd aktualizacji danych o cerze"
      );
    }

    alert("Dane o cerze zostały zaktualizowane.");
    return responseBody;
  } catch (error) {
    console.error("Błąd podczas komunikacji z serwerem:", error.message);
    alert(
      error.message || "Wystąpił błąd podczas aktualizacji danych o cerze."
    );
  }
};

// Funkcja do ładowania danych o cerze
const loadSkinData = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/skin?userId=${userId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Błąd pobierania danych o cerze");
    }

    document.getElementById("skinTypeNew").value = data.skinData.skinType || "";

    // Resetowanie stanu wszystkich checkboxów przed ustawieniem nowych
    document
      .querySelectorAll('input[name="skinIssuesNew"]')
      .forEach((checkbox) => {
        checkbox.checked = false; // Upewnij się, że wszystkie checkboxy są odznaczone
      });

    // Ustawienie checkboxów na podstawie pobranych danych
    document
      .querySelectorAll('input[name="skinIssuesNew"]')
      .forEach((checkbox) => {
        const isChecked = data.skinData.skinIssues.includes(checkbox.value);
        checkbox.checked = isChecked; // Ustawienie checkboxa na podstawie danych
      });
  } catch (error) {
    console.error("Błąd podczas pobierania danych o cerze:", error);
    alert("Wystąpił błąd podczas pobierania danych o cerze.");
  }
};

// Obsługa kliknięcia przycisku do edytowania danych
document
  .getElementById("editSkinType")
  .addEventListener("click", async function () {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Brak identyfikatora użytkownika.");
      return;
    }
    await loadSkinData(userId);
    // Pokaż sekcję edycji danych
    skinData.style.display = "flex";
    mainSection.style.display = "none";
  });

// Funkcja obsługująca kliknięcie przycisku "Zapisz zmiany" w formularzu
document
  .getElementById("skinForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Zapobiega odświeżeniu strony

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Brak identyfikatora użytkownika.");
      return;
    }

    // Pobieranie danych z formularza
    const skinType = document.getElementById("skinTypeNew").value;

    // Tylko zaznaczone checkboxy dodajemy
    const skinIssues = Array.from(
      document.querySelectorAll('input[name="skinIssuesNew"]:checked')
    ).map((checkbox) => checkbox.value);

    // Sprawdzanie, czy wszystkie wymagane pola są uzupełnione
    if (!skinType || skinIssues.length === 0) {
      alert("Proszę uzupełnić wszystkie wymagane informacje!");
      return;
    }
    const updates = {};
    updates.skinType = skinType;
    updates.skinIssues = skinIssues;

    // Wywołanie funkcji aktualizującej dane użytkownika
    try {
      await updateSkinData(userId, updates);

      // Pokazanie głównej sekcji
      skinData.style.display = "none";
      mainSection.style.display = "flex";
    } catch (error) {
      console.error("Błąd podczas aktualizacji danych o cerze:", error);
      alert("Wystąpił błąd podczas aktualizacji danych o cerze.");
    }
  });

// Obsługa przycisku "Wróć do głównej sekcji"
document
  .getElementById("backToMainFromUpdateSkin")
  .addEventListener("click", function () {
    skinData.style.display = "none";
    mainSection.style.display = "flex";
  });
