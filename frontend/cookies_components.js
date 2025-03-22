// Funkcja do zapisywania odwiedzonych dyskusji w ciasteczku
function trackDiscussionVisit(userId, topic) {
  let visitedDiscussions = getCookie("visitedDiscussions") || {};

  // Sprawdź, czy dane z ciasteczka są poprawne
  if (typeof visitedDiscussions === "string") {
    try {
      visitedDiscussions = JSON.parse(visitedDiscussions);
    } catch {
      visitedDiscussions = {}; // W razie błędu, zacznij od pustego obiektu
    }
  }

  // Inicjalizuj historię użytkownika, jeśli nie istnieje
  if (!visitedDiscussions[userId]) {
    visitedDiscussions[userId] = [];
  }

  visitedDiscussions[userId].push(topic);

  // Ogranicz historię do ostatnich 5 tematów
  if (visitedDiscussions[userId].length > 5) {
    visitedDiscussions[userId].shift();
  }

  // Zapisz dane w ciasteczku
  document.cookie = `visitedDiscussions=${encodeURIComponent(
    JSON.stringify(visitedDiscussions)
  )}; expires=Thu, 18 Dec 2025 12:00:00 UTC; path=/`;
}

// Funkcja do pobierania danych z ciasteczka
function getCookie(name) {
  const cookieString = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  if (!cookieString) return null;

  const cookieValue = cookieString.split("=")[1];

  try {
    // Parsowanie danych JSON
    return JSON.parse(decodeURIComponent(cookieValue));
  } catch (error) {
    console.error("Błąd parsowania JSON z ciasteczka:", error);
    return null;
  }
}

// Funkcja do wyświetlania odwiedzonych dyskusji
function displayVisitedDiscussions(userId) {
  // Pobierz ciasteczko z historią odwiedzin
  const visitedDiscussions = getCookie("visitedDiscussions");

  if (visitedDiscussions) {
    // Pobierz dyskusje tylko dla podanego użytkownika
    const userDiscussions = visitedDiscussions[userId] || [];

    const discussionContainer = document.getElementById(
      "visited-discussions-container"
    );
    discussionContainer.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = "Odwiedzone dyskusje:";
    discussionContainer.appendChild(title);

    if (userDiscussions.length === 0) {
      // Wyświetl informację, jeśli brak danych
      discussionContainer.textContent = "Brak odwiedzonych dyskusji.";
    } else {
      // Twórz elementy dla każdej odwiedzonej dyskusji
      userDiscussions.forEach((topic, id) => {
        const link = document.createElement("a");
        id += 1;
        // Generowanie daty w formacie "dnia: dd-mm-yyyy"
        const today = new Date();
        const formattedDate = `${today
          .getDate()
          .toString()
          .padStart(2, "0")}-${(today.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${today.getFullYear()}`;

        link.textContent = `${id}. Dyskusja: ${topic}, dnia: ${formattedDate}`;
        link.style.display = "block"; // Wyświetlanie w osobnych liniach
        discussionContainer.appendChild(link);
      });
    }
  } else {
  }
}

// Funkcja do usuwania ciasteczka
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

// Eksport funkcji
export { trackDiscussionVisit, displayVisitedDiscussions, deleteCookie };
