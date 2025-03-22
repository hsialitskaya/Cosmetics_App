const submitSkinInfo = document.getElementById("submitSkinInfo");

const skinInfo = async (skinType, skinIssues, userId) => {
  const response = await fetch(`${API_URL}/skin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ skinType, skinIssues, userId }),
  });

  if (!response.ok) throw new Error("Błąd wysyłania danych o cerze");
  return response.json();
};

submitSkinInfo.addEventListener("click", async () => {
  const skinType = document.getElementById("skinType").value;
  const skinIssues = Array.from(
    document.querySelectorAll('input[name="skinIssues"]:checked')
  ).map((checkbox) => checkbox.value);
  const userId = localStorage.getItem("userId");

  // Sprawdzanie, czy wszystkie wymagane pola są uzupełnione
  if (!skinType || skinIssues.length === 0) {
    alert("Proszę uzupełnić wszystkie wymagane informacje!");
    return;
  }

  try {
    const response = await skinInfo(skinType, skinIssues, userId);
    if (response) {
      alert("Dane zostały zapisane!");
      skinInfoSection.style.display = "none";
      cookiesSection.style.display = "flex";
    }
  } catch (error) {
    alert(`Błąd dodawania informacji o skorze: ${error.message}`);
  }
});

// Funkcja do pobierania danych o skórze użytkownika z serwera
const getSkinInfo = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/skin/${userId}`);

    if (!response.ok) {
      throw new Error("Błąd podczas pobierania danych o skórze");
    }

    const skinInfo = await response.json();
    return skinInfo;
  } catch (error) {
    console.error("Błąd podczas pobierania danych o skórze:", error);
    throw error;
  }
};
