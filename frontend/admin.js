import socket from "./websocket.js";

// Logowanie
const loginAdminSection = document.getElementById("loginAdminSection");
const adminSection = document.getElementById("adminSection");
const chooseAdminBtn = document.getElementById("adminLogin");
const loginAdminBtn = document.getElementById("loginAdminBtn");

const loginAdminLogin = document.getElementById("loginAdminLogin");
const loginAdminPassword = document.getElementById("loginAdminPassword");

chooseAdminBtn.addEventListener("click", () => {
  loginAdminSection.style.display = "flex";
  choiceSection.style.display = "none";
});

const loginAdmin = async (login, password) => {
  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Response error data:", errorData);
      throw new Error(errorData.message || "Błąd logowania");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in loginUser function:", error);
    throw error;
  }
};

loginAdminBtn.addEventListener("click", async () => {
  try {
    const response = await loginAdmin(
      loginAdminLogin.value,
      loginAdminPassword.value
    );
    if (response) {
      localStorage.setItem("userId", "admin");
      alert("Logowanie udane!");
      loginAdminSection.style.display = "none";
      adminSection.style.display = "flex";
      loginAdminLogin.value = "";
      loginAdminPassword.value = "";
    }
  } catch (error) {
    alert(`Błąd logowania: ${error.message}`); // Wyświetlenie błędu
  }
});

document.getElementById("backToChoice3").addEventListener("click", () => {
  loginAdminSection.style.display = "none";
  choiceSection.style.display = "flex";
});

// Zarzadzanie uzytkownikami
// Funkcja do pobierania użytkowników
const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Błąd podczas pobierania użytkowników"
      );
    }
    return await response.json(); // Zwraca listę użytkowników
  } catch (error) {
    console.error("Error in fetchUsers function:", error);
    alert("Nie udało się pobrać użytkowników");
    return [];
  }
};

// Funkcja do usuwania użytkownika
const deleteUser = async (id) => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Błąd podczas usuwania użytkownika");
    }
    alert("Użytkownik został usunięty");
    renderUserList(); // Ponowne renderowanie listy użytkowników po usunięciu
  } catch (error) {
    console.error("Error in deleteUser function:", error);
    alert("Nie udało się usunąć użytkownika");
  }
};

// Funkcja do renderowania listy użytkowników
const renderUserList = async () => {
  const userList = document.getElementById("userListInAdmin");
  userList.innerHTML = ""; // Czyszczenie listy przed załadowaniem

  const users = await fetchUsers(); // Pobranie użytkowników
  if (users.length === 0) {
    userList.innerHTML = "<li>Brak użytkowników do wyświetlenia</li>";
    return;
  }

  users.forEach((user) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${user.firstName} ${user.lastName} (${user.email})`;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Usuń";
    deleteButton.addEventListener("click", () => deleteUser(user.id)); // Obsługa usuwania użytkownika

    listItem.appendChild(deleteButton);
    userList.appendChild(listItem);
  });
};

// Obsługa powrotu do głównej sekcji administratora
document
  .getElementById("backToAdminFromUsers")
  .addEventListener("click", () => {
    document.getElementById("usersSection").style.display = "none";
    adminSection.style.display = "flex";
  });

// Wywołanie funkcji renderowania listy po otwarciu sekcji użytkowników
document.getElementById("manageUsers").addEventListener("click", () => {
  adminSection.style.display = "none";
  document.getElementById("usersSection").style.display = "flex";
  renderUserList();
});

// Funkcja do pobierania kosmetyków
const fetchCosmetics = async () => {
  try {
    const response = await fetch(`${API_URL}/cosmetics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Błąd podczas pobierania kosmetyków"
      );
    }
    return await response.json(); // Zwraca listę kosmetyków
  } catch (error) {
    console.error("Error in fetchCosmetics function:", error);
    alert("Nie udało się pobrać kosmetyków");
    return [];
  }
};

// Funkcja do usuwania kosmetyku
const deleteCosmetic = async (id) => {
  try {
    const response = await fetch(`${API_URL}/cosmetics/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Błąd podczas usuwania kosmetyku");
    }
    alert("Kosmetyk został usunięty");
    socket.send(JSON.stringify({ type: "deleteCosmetic" }));

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "cosmetic") {
        // Znajdź kontener dla wiadomości
        const messagesContainer = document.getElementById(
          "temporaryMessagesContainer"
        );

        // Utwórz element listy dla wiadomości
        const messageElement = document.createElement("li");
        messageElement.classList.add("temporary-message"); // Dodanie klasy dla stylizacji
        messageElement.innerText = message.text;

        // Dodaj wiadomość do listy
        messagesContainer.appendChild(messageElement);

        // Usuń wiadomość po 5 minutach
        setTimeout(() => {
          if (messageElement.parentElement) {
            messageElement.remove();
          }
        }, 5 * 60 * 1000); // 5 minut w milisekundach
      }
    };

    renderCosmeticsList(); // Ponowne renderowanie listy kosmetyków po usunięciu
  } catch (error) {
    console.error("Error in deleteCosmetic function:", error);
    alert("Nie udało się usunąć kosmetyku");
  }
};

// Funkcja do renderowania listy kosmetyków
const renderCosmeticsList = async () => {
  const cosmeticsList = document.getElementById("cosmeticsListInAdmin");
  cosmeticsList.innerHTML = ""; // Czyszczenie listy przed załadowaniem

  const cosmetics = await fetchCosmetics(); // Pobranie kosmetyków
  if (cosmetics.length === 0) {
    cosmeticsList.innerHTML = "<li>Brak kosmetyków do wyświetlenia</li>";
    return;
  }

  cosmetics.forEach((cosmetic) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${cosmetic.name} - ${cosmetic.type} `;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Usuń";
    deleteButton.addEventListener("click", () => deleteCosmetic(cosmetic.id)); // Obsługa usuwania kosmetyku

    listItem.appendChild(deleteButton);
    cosmeticsList.appendChild(listItem);
  });
};

// Obsługa powrotu do głównej sekcji administratora
document
  .getElementById("backToAdminFromCosmetics")
  .addEventListener("click", () => {
    document.getElementById("cosmeticsSection").style.display = "none";
    adminSection.style.display = "flex";
  });

// Wywołanie funkcji renderowania listy po otwarciu sekcji kosmetyków
document.getElementById("manageCosmetics").addEventListener("click", () => {
  adminSection.style.display = "none";
  document.getElementById("cosmeticsSection").style.display = "flex";
  renderCosmeticsList();
});

// Funkcja do dodawania kosmetyku
const addCosmetic = async (name, type, skinType, skinIssues) => {
  try {
    const response = await fetch(`${API_URL}/cosmetics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, type, skinType, skinIssues }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Błąd podczas dodawania kosmetyku");
    }

    alert("Kosmetyk został dodany");

    // Powiadomienie o nowym kosmetyku
    const newCosmetic = { name, type, skinType, skinIssues };
    socket.send(JSON.stringify({ type: "newCosmetic", cosmetic: newCosmetic }));

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "cosmetic") {
        // Znajdź kontener dla wiadomości
        const messagesContainer = document.getElementById(
          "temporaryMessagesContainer"
        );
        // Utwórz element listy dla wiadomości
        const messageElement = document.createElement("li");
        messageElement.classList.add("temporary-message"); // Dodanie klasy dla stylizacji
        messageElement.innerText = message.text;

        // Dodaj wiadomość do listy
        messagesContainer.appendChild(messageElement);

        // Usuń wiadomość po 5 minutach
        setTimeout(() => {
          if (messageElement.parentElement) {
            messageElement.remove();
          }
        }, 5 * 60 * 1000); // 5 minut w milisekundach
      }
    };

    renderCosmeticsList(); // Odświeżenie listy kosmetyków
  } catch (error) {
    console.error("Błąd podczas dodawania kosmetyku:", error);
    alert("Nie udało się dodać kosmetyku");
  }
};

// Obsługa przycisku otwierającego formularz dodawania kosmetyku
document.getElementById("showAddCosmeticForm").addEventListener("click", () => {
  document.getElementById("addCosmeticSection").style.display = "flex";
  document.getElementById("cosmeticsSection").style.display = "none";
});

// Obsługa przycisku anulowania w formularzu
document
  .getElementById("cancelAddCosmeticForm")
  .addEventListener("click", () => {
    document.getElementById("addCosmeticSection").style.display = "none";
    document.getElementById("cosmeticsSection").style.display = "flex";
  });

// Obsługa formularza dodawania kosmetyku
document
  .getElementById("addCosmeticSection")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("cosmeticName").value;
    const type = document.getElementById("cosmeticType").value;
    const skinType = Array.from(
      document.querySelectorAll("input[name='skinType']:checked")
    ).map((checkbox) => checkbox.value);
    const skinIssues = Array.from(
      document.querySelectorAll("input[name='skinIssues']:checked")
    ).map((checkbox) => checkbox.value);

    if (!name || !type || skinType.length === 0 || skinIssues.length === 0) {
      alert("Proszę wypełnić wszystkie pola");
      return;
    }

    await addCosmetic(name, type, skinType, skinIssues);

    // Czyszczenie formularza i zamknięcie sekcji
    document.getElementById("addCosmeticForm").reset();
    document.getElementById("addCosmeticSection").style.display = "none";
    document.getElementById("cosmeticsSection").style.display = "flex";
  });

// Wylogowanie
document.getElementById("adminLogout").addEventListener("click", () => {
  adminSection.style.display = "none";
  choiceSection.style.display = "flex";
  localStorage.removeItem("userId");
});
