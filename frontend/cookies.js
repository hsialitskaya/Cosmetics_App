document.getElementById("acceptCookies").addEventListener("click", async () => {
  // Zapisz zgodę użytkownika na ciasteczka
  document.cookie =
    "cookiesConsent=true; expires=Thu, 18 Dec 2025 12:00:00 UTC; path=/";

  // Pobierz ID użytkownika z localStorage
  const userId = localStorage.getItem("userId");

  try {
    // Wysyłanie zgody na ciasteczka do backendu
    const response = await fetch(`${API_URL}/users/${userId}/consent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ consent: true }),
    });

    if (!response.ok) {
      console.error("Błąd podczas wysyłania zgody na ciasteczka");
      return;
    }

    document.getElementById("cookiesSection").style.display = "none";
    mainSection.style.display = "flex";
  } catch (error) {
    console.error("Błąd podczas połączenia z API:", error);
  }
});

document.getElementById("rejectCookies").addEventListener("click", async () => {
  // Zapisz odmowę użytkownika na ciasteczka
  document.cookie =
    "cookiesConsent=false; expires=Thu, 18 Dec 2025 12:00:00 UTC; path=/";

  // Pobierz ID użytkownika z localStorage
  const userId = localStorage.getItem("userId");

  try {
    // Wysyłanie odmowy na ciasteczka do backendu
    const response = await fetch(`${API_URL}/users/${userId}/consent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ consent: false }),
    });

    if (!response.ok) {
      console.error("Błąd podczas wysyłania odmowy zgody na ciasteczka");
      return;
    }

    document.getElementById("cookiesSection").style.display = "none";
    mainSection.style.display = "flex";
  } catch (error) {
    console.error("Błąd podczas połączenia z API:", error);
  }
});
