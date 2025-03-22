let allCosmeticsRec = []; // Zmienna do przechowywania wszystkich kosmetyków

// Funkcja do pobierania danych o skórze użytkownika
const getSkinData = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/skin?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Błąd: ${response.statusText}`);
    }
    const { skinData } = await response.json();
    return skinData;
  } catch (error) {
    console.error("Błąd podczas pobierania danych o cerze:", error);
    alert("Nie udało się pobrać danych o cerze.");
  }
};

// Funkcja do pobierania polecanych kosmetyków
const getRecommendations = async (skinType, skinIssues) => {
  try {
    const response = await fetch(`${API_URL}/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        skinType: skinType,
        skinIssues: skinIssues,
      }),
    });

    if (!response.ok) {
      throw new Error(`Błąd: ${response.statusText}`);
    }

    const cosmetics = await response.json();
    allCosmeticsRec = cosmetics; // Zapisz wszystkie pobrane kosmetyki w zmiennej

    return cosmetics; // Zwróć kosmetyki
  } catch (error) {
    console.error("Błąd podczas pobierania polecanych kosmetyków:", error);
    alert("Nie udało się pobrać polecanych kosmetyków.");
  }
};

// Funkcja do dodawania kosmetyku do ulubionych
const addFavorite = async (cosmeticId, userId) => {
  try {
    const response = await fetch(`${API_URL}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cosmeticId, userId }),
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || `Błąd: ${response.statusText}`);
    }

    const fav = await response.json();
    alert(fav.message || "Kosmetyk został dodany do ulubionych.");
    return fav; // Zwróć dane odpowiedzi (np. status sukcesu)
  } catch (error) {
    console.error("Błąd podczas dodawania kosmetyku do ulubionych:", error);
    alert(`Nie udało się dodać kosmetyku do ulubionych: ${error.message}`);
  }
};

const searchCosmetics = async (searchPattern) => {
  try {
    const response = await fetch(
      `${API_URL}/recommendations?pattern=${searchPattern}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status !== 404) {
        // Inne błędy są logowane w konsoli
        console.error("Błąd odpowiedzi od serwera:", response.statusText);
        alert("Wystąpił błąd podczas wyszukiwania kosmetyków.");
      }
      throw new Error(`Błąd: ${response.statusText}`);
    }

    const cosmetics = await response.json();
    return cosmetics; // Zwróć kosmetyki
  } catch (error) {
    alert("Nie udało się wyszukać kosmetyków.");
  }
};

// Funkcja do glosowania
function voteForCosmetic(cosmetic, voteType) {
  fetch(`${API_URL}/cosmetics/${cosmetic.id}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      voteType: voteType,
    }),
  })
    .then((response) => response.json()) // Oczekujemy na odpowiedź w formacie JSON
    .then((data) => {
      if (data && data.votes !== undefined) {
        // Aktualizujemy interfejs na podstawie otrzymanych głosów
        const votesDisplay = document.querySelector(
          `.cosmetic-votes[data-cosmetic-id="${cosmetic.id}"]`
        );

        if (votesDisplay) {
          votesDisplay.textContent = `Głosów: ${data.votes}`;
        }
      } else {
        console.error("Brak danych o głosach w odpowiedzi.");
      }
    })
    .catch((error) => {
      console.error("Błąd podczas głosowania:", error);
    });
}

// Funkcja do wyświetlenia ilości polubień
async function favCosmetic(cosmetics) {
  try {
    const response = await fetch(`${API_URL}/cosmetics/fav`, {
      method: "POST", // Użycie POST zamiast GET
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cosmetics }), // Przekazujemy dane w body
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return data.amount || 0;
  } catch (error) {
    console.error("Błąd podczas pobierania polubień:", error);
    throw error;
  }
}

// Obsługuje kliknięcie na przycisk "Zobacz pasujące kosmetyki"
document
  .getElementById("viewMatchingCosmetics")
  .addEventListener("click", async function () {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Brak identyfikatora użytkownika.");
      return;
    }
    document.getElementById("cosmeticSearch").value = "";
    // Pobieramy dane o skórze użytkownika
    const skinData = await getSkinData(userId);

    if (skinData) {
      const { skinType, skinIssues } = skinData;

      try {
        // Pobieramy polecane kosmetyki
        const cosmetics = await getRecommendations(skinType, skinIssues);
        const cosmetic_fav = await favCosmetic(cosmetics);

        const cosmeticsList = document.getElementById("cosmeticsList");
        cosmeticsList.innerHTML = ""; // Wyczyść poprzednią listę

        if (cosmetics && cosmetics.length === 0) {
          cosmeticsList.innerHTML = "<li>Brak polecanych kosmetyków.</li>";
        } else {
          console.log(cosmetics);

          // Dodaj kosmetyki do listy
          cosmetics.forEach((cosmetic) => {
            const div = document.createElement("div"); // Tworzymy kontener <div>
            div.classList.add("cosmetic-item"); // Dodajemy klasę dla stylizacji

            const listItem = document.createElement("li"); // Tworzymy element <li>
            listItem.textContent = `${cosmetic.name} `;

            const fav = document.createElement("p");
            fav.setAttribute("data-cosmetic-id", cosmetic.id); // Tworzymy element <li>
            fav.textContent = `${
              cosmetic_fav.amount[cosmetic.id] || 0
            } użytkowników dodało do ulubionych`;

            const favButton = document.createElement("button"); // Tworzymy przycisk
            favButton.textContent = "Dodaj do ulubionych";
            favButton.classList.add("like");

            // Obsługuje kliknięcie przycisku "Dodaj do ulubionych"
            favButton.addEventListener("click", async () => {
              try {
                await addFavorite(cosmetic.id, userId); // Dodanie do ulubionych

                // Pobranie właściwego elementu <p> na podstawie atrybutu data-cosmetic-id
                const favElement = document.querySelector(
                  `p[data-cosmetic-id="${cosmetic.id}"]`
                );

                const updatedFavData = await favCosmetic([cosmetic]);

                favElement.textContent = `${
                  updatedFavData.amount[cosmetic.id] || 0
                } użytkowników dodało do ulubionych`;
              } catch (error) {
                console.error("Błąd podczas dodawania do ulubionych:", error);
              }
            });

            const commentButton = document.createElement("button"); // Tworzymy przycisk "Komentarze"
            commentButton.textContent = "Komentarze";
            commentButton.classList.add("comment");
            commentButton.setAttribute("data-cosmetic-id", cosmetic.id);

            // Obsługa kliknięcia przycisku "Komentarz"
            commentButton.addEventListener("click", async (e) => {
              const cosmeticId = e.target.getAttribute("data-cosmetic-id");
              document
                .getElementById("commentForm")
                .setAttribute("data-cosmetic-id", cosmeticId); // Przypisujemy ID do formularza
              document.getElementById("cosmeticsMenu").style.display = "none"; // Ukrywamy menu kosmetyków
              document.getElementById("commentSection").style.display = "flex"; // Pokazujemy sekcję komentarzy

              // Pobierz komentarze dla danego kosmetyku
              await getComments(cosmeticId);
            });

            const cosmeticButtons = document.createElement("div");
            cosmeticButtons.classList.add("cosmetic-buttons");

            const cosmeticCard = document.createElement("div");
            cosmeticCard.classList.add("cosmetic-card");

            // Wyświetlanie liczby głosów u góry
            const cosmeticVotes = document.createElement("div");
            cosmeticVotes.textContent = `Głosów: ${
              (cosmetic.upVotes || 0) - (cosmetic.downVotes || 0)
            }`;
            cosmeticVotes.classList.add("cosmetic-votes");
            cosmeticVotes.setAttribute("data-cosmetic-id", cosmetic.id);
            cosmeticCard.appendChild(cosmeticVotes);

            // Sekcja z przyciskami
            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("button-container");

            const likeCosmeticButton = document.createElement("button");
            likeCosmeticButton.textContent = "Lubię to";
            likeCosmeticButton.classList.add("like-cosmetic");
            likeCosmeticButton.addEventListener("click", () => {
              voteForCosmetic(cosmetic, "up");
            });

            const dislikeCosmeticButton = document.createElement("button");
            dislikeCosmeticButton.textContent = "Nie lubię";
            dislikeCosmeticButton.classList.add("dislike-cosmetic");
            dislikeCosmeticButton.addEventListener("click", () => {
              voteForCosmetic(cosmetic, "down");
            });

            buttonContainer.appendChild(likeCosmeticButton);
            buttonContainer.appendChild(dislikeCosmeticButton);

            // Dodanie przycisków poniżej liczby głosów
            cosmeticCard.appendChild(buttonContainer);
            cosmeticButtons.appendChild(cosmeticCard);
            cosmeticButtons.appendChild(favButton);
            cosmeticButtons.appendChild(commentButton);

            // Dodajemy elementy <li>, <button> do kontenera <div>
            div.appendChild(listItem);
            div.appendChild(fav);
            div.appendChild(cosmeticButtons);

            // Dodajemy <div> do listy kosmetyków
            cosmeticsList.appendChild(div);
          });
        }

        // Pokaż sekcję z kosmetykami
        document.getElementById("cosmeticsMenu").style.display = "flex";
        document.getElementById("mainSection").style.display = "none";
      } catch (error) {
        console.error("Błąd podczas pobierania kosmetyków:", error);
      }
    }
  });

// Obsługuje kliknięcie na przycisk "Szukaj kosmetyki"
document
  .getElementById("searchCosmetic")
  .addEventListener("click", async function () {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Brak identyfikatora użytkownika.");
      return;
    }
    const searchPattern = document.getElementById("cosmeticSearch").value;

    if (!searchPattern) {
      alert("Proszę wpisać wzorzec do wyszukiwania.");
      return;
    }

    // Pobieramy kosmetyki na podstawie wzorca
    const cosmeticsPattern = await searchCosmetics(searchPattern);

    let cosmetics = null;

    if (Array.isArray(cosmeticsPattern)) {
      cosmetics = cosmeticsPattern.filter((x) =>
        allCosmeticsRec.find((y) => x.id === y.id)
      );
    }
    const cosmeticsList = document.getElementById("cosmeticsList");
    cosmeticsList.innerHTML = ""; // Wyczyść poprzednią listę

    if (cosmetics === null) {
      cosmeticsList.innerHTML =
        "<li>Brak kosmetyków pasujących do wzorca.</li>";
    } else {
      // Dodaj kosmetyki do listy
      const cosmetic_fav = await favCosmetic(cosmetics);
      cosmetics.forEach((cosmetic) => {
        const div = document.createElement("div"); // Tworzymy kontener <div>
        div.classList.add("cosmetic-item"); // Dodajemy klasę dla stylizacji

        const listItem = document.createElement("li"); // Tworzymy element <li>
        listItem.textContent = `${cosmetic.name} `;

        const fav = document.createElement("p");
        fav.setAttribute("data-cosmetic-id", cosmetic.id); // Tworzymy element <li>
        fav.textContent = `${
          cosmetic_fav.amount[cosmetic.id] || 0
        } użytkowników dodało do ulubionych`;

        const favButton = document.createElement("button"); // Tworzymy przycisk
        favButton.textContent = "Dodaj do ulubionych";
        favButton.classList.add("like");

        // Obsługuje kliknięcie przycisku "Dodaj do ulubionych"
        favButton.addEventListener("click", async () => {
          try {
            await addFavorite(cosmetic.id, userId); // Dodanie do ulubionych

            // Pobranie właściwego elementu <p> na podstawie atrybutu data-cosmetic-id
            const favElement = document.querySelector(
              `p[data-cosmetic-id="${cosmetic.id}"]`
            );

            const updatedFavData = await favCosmetic([cosmetic]);

            favElement.textContent = `${
              updatedFavData.amount[cosmetic.id] || 0
            } użytkowników dodało do ulubionych`;
          } catch (error) {
            console.error("Błąd podczas dodawania do ulubionych:", error);
          }
        });

        const commentButton = document.createElement("button"); // Tworzymy przycisk "Komentarze"
        commentButton.textContent = "Komentarze";
        commentButton.classList.add("comment");
        commentButton.setAttribute("data-cosmetic-id", cosmetic.id);

        // Obsługa kliknięcia przycisku "Komentarz"
        commentButton.addEventListener("click", async (e) => {
          const cosmeticId = e.target.getAttribute("data-cosmetic-id");
          document
            .getElementById("commentForm")
            .setAttribute("data-cosmetic-id", cosmeticId); // Przypisujemy ID do formularza
          document.getElementById("cosmeticsMenu").style.display = "none"; // Ukrywamy menu kosmetyków
          document.getElementById("commentSection").style.display = "flex"; // Pokazujemy sekcję komentarzy

          // Pobierz komentarze dla danego kosmetyku
          await getComments(cosmeticId);
        });

        const cosmeticButtons = document.createElement("div");
        cosmeticButtons.classList.add("cosmetic-buttons");

        const cosmeticCard = document.createElement("div");
        cosmeticCard.classList.add("cosmetic-card");

        // Wyświetlanie liczby głosów u góry
        const cosmeticVotes = document.createElement("div");
        cosmeticVotes.textContent = `Głosów: ${
          (cosmetic.upVotes || 0) - (cosmetic.downVotes || 0)
        }`;
        cosmeticVotes.classList.add("cosmetic-votes");
        cosmeticVotes.setAttribute("data-cosmetic-id", cosmetic.id);
        cosmeticCard.appendChild(cosmeticVotes);

        // Sekcja z przyciskami
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        const likeCosmeticButton = document.createElement("button");
        likeCosmeticButton.textContent = "Lubię to";
        likeCosmeticButton.classList.add("like-cosmetic");
        likeCosmeticButton.addEventListener("click", () => {
          voteForCosmetic(cosmetic, "up");
        });

        const dislikeCosmeticButton = document.createElement("button");
        dislikeCosmeticButton.textContent = "Nie lubię";
        dislikeCosmeticButton.classList.add("dislike-cosmetic");
        dislikeCosmeticButton.addEventListener("click", () => {
          voteForCosmetic(cosmetic, "down");
        });

        buttonContainer.appendChild(likeCosmeticButton);
        buttonContainer.appendChild(dislikeCosmeticButton);

        // Dodanie przycisków poniżej liczby głosów
        cosmeticCard.appendChild(buttonContainer);
        cosmeticButtons.appendChild(cosmeticCard);
        cosmeticButtons.appendChild(favButton);
        cosmeticButtons.appendChild(commentButton);

        // Dodajemy elementy <li>, <button> do kontenera <div>
        div.appendChild(listItem);
        div.appendChild(fav);
        div.appendChild(cosmeticButtons);

        // Dodajemy <div> do listy kosmetyków
        cosmeticsList.appendChild(div);
      });
    }
  });

// Obsługuje kliknięcie na przycisk "Wyczyść wyszukiwanie"
document
  .getElementById("clearSearch")
  .addEventListener("click", async function () {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Brak identyfikatora użytkownika.");
      return;
    }
    document.getElementById("cosmeticSearch").value = ""; // Wyczyszczenie pola wyszukiwania

    const cosmeticsList = document.getElementById("cosmeticsList");
    cosmeticsList.innerHTML = ""; // Wyczyść poprzednią listę
    if (allCosmeticsRec && allCosmeticsRec.length === 0) {
      cosmeticsList.innerHTML = "<li>Brak polecanych kosmetyków.</li>";
    } else {
      const cosmetic_fav = await favCosmetic(allCosmeticsRec);
      allCosmeticsRec.forEach((cosmetic) => {
        const div = document.createElement("div"); // Tworzymy kontener <div>
        div.classList.add("cosmetic-item"); // Dodajemy klasę dla stylizacji

        const listItem = document.createElement("li"); // Tworzymy element <li>
        listItem.textContent = `${cosmetic.name} `;

        const fav = document.createElement("p");
        fav.setAttribute("data-cosmetic-id", cosmetic.id); // Tworzymy element <li>
        fav.textContent = `${
          cosmetic_fav.amount[cosmetic.id] || 0
        } użytkowników dodało do ulubionych`;

        const favButton = document.createElement("button"); // Tworzymy przycisk
        favButton.textContent = "Dodaj do ulubionych";
        favButton.classList.add("like");

        // Obsługuje kliknięcie przycisku "Dodaj do ulubionych"
        favButton.addEventListener("click", async () => {
          try {
            await addFavorite(cosmetic.id, userId); // Dodanie do ulubionych

            // Pobranie właściwego elementu <p> na podstawie atrybutu data-cosmetic-id
            const favElement = document.querySelector(
              `p[data-cosmetic-id="${cosmetic.id}"]`
            );

            const updatedFavData = await favCosmetic([cosmetic]);

            favElement.textContent = `${
              updatedFavData.amount[cosmetic.id] || 0
            } użytkowników dodało do ulubionych`;
          } catch (error) {
            console.error("Błąd podczas dodawania do ulubionych:", error);
          }
        });

        const commentButton = document.createElement("button"); // Tworzymy przycisk "Komentarze"
        commentButton.textContent = "Komentarze";
        commentButton.classList.add("comment");
        commentButton.setAttribute("data-cosmetic-id", cosmetic.id);

        // Obsługa kliknięcia przycisku "Komentarz"
        commentButton.addEventListener("click", async (e) => {
          const cosmeticId = e.target.getAttribute("data-cosmetic-id");
          document
            .getElementById("commentForm")
            .setAttribute("data-cosmetic-id", cosmeticId); // Przypisujemy ID do formularza
          document.getElementById("cosmeticsMenu").style.display = "none"; // Ukrywamy menu kosmetyków
          document.getElementById("commentSection").style.display = "flex"; // Pokazujemy sekcję komentarzy

          // Pobierz komentarze dla danego kosmetyku
          await getComments(cosmeticId);
        });

        const cosmeticButtons = document.createElement("div");
        cosmeticButtons.classList.add("cosmetic-buttons");

        const cosmeticCard = document.createElement("div");
        cosmeticCard.classList.add("cosmetic-card");

        // Wyświetlanie liczby głosów u góry
        const cosmeticVotes = document.createElement("div");
        cosmeticVotes.textContent = `Głosów: ${
          (cosmetic.upVotes || 0) - (cosmetic.downVotes || 0)
        }`;
        cosmeticVotes.classList.add("cosmetic-votes");
        cosmeticVotes.setAttribute("data-cosmetic-id", cosmetic.id);
        cosmeticCard.appendChild(cosmeticVotes);

        // Sekcja z przyciskami
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        const likeCosmeticButton = document.createElement("button");
        likeCosmeticButton.textContent = "Lubię to";
        likeCosmeticButton.classList.add("like-cosmetic");
        likeCosmeticButton.addEventListener("click", () => {
          voteForCosmetic(cosmetic, "up");
        });

        const dislikeCosmeticButton = document.createElement("button");
        dislikeCosmeticButton.textContent = "Nie lubię";
        dislikeCosmeticButton.classList.add("dislike-cosmetic");
        dislikeCosmeticButton.addEventListener("click", () => {
          voteForCosmetic(cosmetic, "down");
        });

        buttonContainer.appendChild(likeCosmeticButton);
        buttonContainer.appendChild(dislikeCosmeticButton);

        // Dodanie przycisków poniżej liczby głosów
        cosmeticCard.appendChild(buttonContainer);
        cosmeticButtons.appendChild(cosmeticCard);
        cosmeticButtons.appendChild(favButton);
        cosmeticButtons.appendChild(commentButton);

        // Dodajemy elementy <li>, <button> do kontenera <div>
        div.appendChild(listItem);
        div.appendChild(fav);
        div.appendChild(cosmeticButtons);

        // Dodajemy <div> do listy kosmetyków
        cosmeticsList.appendChild(div);
      });
    }
  });

// Obsługuje kliknięcie na przycisk "Wróć do głównej sekcji"
document
  .getElementById("backToMainFromCosmetics")
  .addEventListener("click", function () {
    document.getElementById("cosmeticsMenu").style.display = "none";
    document.getElementById("mainSection").style.display = "flex";
  });

// Obsługa przycisku "Wróć do głównej sekcji"
document
  .getElementById("backToMainFromCosmetics")
  .addEventListener("click", function () {
    document.getElementById("cosmeticsMenu").style.display = "none";
    document.getElementById("mainSection").style.display = "flex";
  });
