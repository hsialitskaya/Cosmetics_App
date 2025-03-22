// Funkcja do pobierania ulubionych kosmetykow
const loadFavorites = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/favorites?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Błąd: ${response.statusText}`);
    }

    const favoritesFromServer = await response.json();
    return favoritesFromServer;
  } catch (error) {
    console.error("Błąd podczas pobierania ulubionych kosmetyków:", error);
    alert("Nie udało się załadować ulubionych kosmetyków.");
  }
};

// Funkcja do usuwania kosmetyków
const dropFavorite = async (userId, cosmeticId, element) => {
  try {
    const response = await fetch(
      `${API_URL}/favorites?userId=${userId}&cosmeticId=${cosmeticId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Błąd: ${response.statusText}`);
    }

    const result = await response.json();

    // Usuń kosmetyk z widoku, jeśli usunięcie na serwerze się powiodło
    if (element) {
      element.remove();
    }
  } catch (error) {
    console.error("Błąd podczas usuwania kosmetyku z ulubionych:", error);
    alert("Nie udało się usunąć kosmetyku z ulubionych.");
  }
};

// Obsługuje kliknięcie na przycisk "Zobacz pasujące kosmetyki"
document
  .getElementById("viewFavoriteCosmetics")
  .addEventListener("click", async function () {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("Brak identyfikatora użytkownika.");
      return;
    }
    try {
      // Pobieramy ulubione kosmetyki
      const cosmetics = await loadFavorites(userId);
      console.log(cosmetics);

      const favoriteList = document.getElementById("favoriteList");
      favoriteList.innerHTML = ""; // Wyczyść poprzednią listę

      if (cosmetics && cosmetics.length === 0) {
        favoriteList.innerHTML = "<li>Brak ulubionych kosmetyków.</li>";
      } else {
        // Dodaj kosmetyki do listy
        cosmetics.forEach((cosmetic) => {
          const div = document.createElement("div"); // Tworzymy kontener <div>
          div.classList.add("cosmetic-item"); // Dodajemy klasę dla stylizacji

          const listItem = document.createElement("li"); // Tworzymy element <li>
          listItem.textContent = cosmetic.name;

          const deleteButton = document.createElement("button"); // Tworzymy przycisk
          deleteButton.textContent = "Usuń z ulubionych";
          deleteButton.classList.add("delete");

          // Obsługuje kliknięcie przycisku "Usuń z ulubionych"
          deleteButton.addEventListener("click", () => {
            dropFavorite(userId, cosmetic.id, div); // Przekazujemy kontener <div> do usunięcia
          });

          // Dodajemy <li> i <button> do kontenera <div>
          div.appendChild(listItem);
          div.appendChild(deleteButton);

          // Dodajemy <div> do listy kosmetyków
          favoriteList.appendChild(div);
        });
      }

      // Pokaż sekcję z kosmetykami
      document.getElementById("favoriteMenu").style.display = "flex";
      mainSection.style.display = "none";
    } catch (error) {
      console.error("Błąd podczas pobierania kosmetyków:", error);
    }
  });

// Obsługa przycisku "Wróć do głównej sekcji"
document
  .getElementById("backToMainFromFavorite")
  .addEventListener("click", function () {
    document.getElementById("favoriteMenu").style.display = "none";
    mainSection.style.display = "flex";
  });
