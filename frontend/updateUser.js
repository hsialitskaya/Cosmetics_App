const userData = document.getElementById("userData");

// Funkcja do aktualizacji danych użytkownika
const updateUserData = async (userId, updates) => {
  try {
    const response = await fetch(`${API_URL}/updateUser`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, updates }),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      throw new Error(
        responseBody.message || "Błąd aktualizacji danych użytkownika"
      );
    }

    alert("Dane użytkownika zostały zaktualizowane.");
    return responseBody;
  } catch (error) {
    console.error("Błąd podczas komunikacji z serwerem:", error.message);
    alert(error.message || "Wystąpił błąd podczas aktualizacji danych.");
  }
};

// Obsługa kliknięcia przycisku do edytowania danych
document
  .getElementById("editPersonalData")
  .addEventListener("click", function () {
    // Pokaż sekcję edycji danych
    userData.style.display = "flex";
    mainSection.style.display = "none";
  });

// Obsługa kliknięcia przycisku "Zapisz zmiany" w formularzu
document
  .getElementById("userForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Zapobiega odświeżeniu strony
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Brak identyfikatora użytkownika.");
      return;
    }

    // Pobieranie danych z formularza
    const name = document.getElementById("firstName").value;
    const surname = document.getElementById("lastName").value;
    const age = document.getElementById("age").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const updates = {};

    if (name.length !== 0) updates.firstName = name;
    if (surname.length !== 0) updates.lastName = surname;
    if (age.length !== 0) {
      if (isNaN(age) || parseInt(age, 10) <= 0) {
        alert("Wprowadź poprawny wiek.");
        return;
      }
      updates.age = parseInt(age, 10);
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (email.length !== 0) {
      if (!emailRegex.test(email)) {
        alert("Wprowadź poprawny adres e-mail.");
        return;
      }
      updates.email = email;
    }
    if (password && password.length >= 10) updates.password = password;
    if (Object.keys(updates).length === 0) {
      alert("Nie wprowadzono żadnych zmian.");
      return;
    }

    // Wywołanie funkcji aktualizującej dane użytkownika
    try {
      await updateUserData(userId, updates);
      // Pokazanie głównej sekcji
      userData.style.display = "none";
      mainSection.style.display = "flex";
      document.getElementById("userForm").reset();
    } catch (error) {
      console.error("Błąd podczas aktualizacji danych:", error);
      alert("Wystąpił błąd podczas aktualizacji danych.");
    }
  });

// Obsługa przycisku "Wróć do głównej sekcji"
document
  .getElementById("backToMainFromUpdateUser")
  .addEventListener("click", function () {
    userData.style.display = "none";
    mainSection.style.display = "flex";
  });
