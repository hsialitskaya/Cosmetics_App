// Elementy HTML
const choiceSection = document.getElementById("choiceSection");
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const skinInfoSection = document.getElementById("skinInfoSection");
const chooseRegisterBtn = document.getElementById("chooseRegister");
const chooseLoginBtn = document.getElementById("chooseLogin");
const backToChoice1 = document.getElementById("backToChoice1");
const backToChoice2 = document.getElementById("backToChoice2");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const mainSection = document.getElementById("mainSection");

// Inputy logowania i rejestracji
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const registerName = document.getElementById("registerName");
const registerSurname = document.getElementById("registerSurname");
const registerAge = document.getElementById("registerAge");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

// Obsługa wyboru
chooseRegisterBtn.addEventListener("click", () => {
  registerSection.style.display = "flex";
  choiceSection.style.display = "none"; // Hides the choice section
});

chooseLoginBtn.addEventListener("click", () => {
  loginSection.style.display = "flex";
  choiceSection.style.display = "none"; // Hides the choice section
});

backToChoice1.addEventListener("click", () => {
  loginSection.style.display = "none";
  choiceSection.style.display = "flex"; // Hides the choice section
});

backToChoice2.addEventListener("click", () => {
  registerSection.style.display = "none";
  choiceSection.style.display = "flex";
});

//URL
const API_URL = "https://localhost:5001/api";

// Funkcja logowania
const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
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

loginBtn.addEventListener("click", async () => {
  try {
    const response = await loginUser(loginEmail.value, loginPassword.value);
    if (response) {
      localStorage.setItem("userId", response.user.id);
      alert("Logowanie udane!");
      loginSection.style.display = "none";
      mainSection.style.display = "flex";
      loginEmail.value = "";
      loginPassword.value = "";
    }
  } catch (error) {
    alert(`Błąd logowania: ${error.message}`); // Wyświetlenie błędu
  }
});

// Funkcja rejestracji
const registerUser = async (firstName, lastName, age, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName,
      lastName,
      age,
      email,
      password,
    }),
  });
  if (!response.ok) throw new Error("Błąd rejestracji");
  const data = await response.json();
  return data;
};

registerBtn.addEventListener("click", async () => {
  if (
    !registerName.value ||
    !registerSurname.value ||
    !registerAge.value ||
    !registerEmail.value ||
    !registerPassword.value
  ) {
    alert("Wszystkie pola są wymagane!");
    return;
  }

  try {
    const response = await registerUser(
      registerName.value,
      registerSurname.value,
      registerAge.value,
      registerEmail.value,
      registerPassword.value
    );

    if (response && response.user.id) {
      localStorage.setItem("userId", response.user.id); // Zapisanie userId w localStorage
      alert("Rejestracja udana!");
      registerSection.style.display = "none";
      skinInfoSection.style.display = "flex";
      registerName.value = "";
      registerSurname.value = "";
      registerAge.value = "";
      registerEmail.value = "";
      registerPassword.value = "";
    } else {
      alert("Błąd rejestracji: Brak userId w odpowiedzi");
    }
  } catch (error) {
    alert(`Błąd rejestracji: ${error.message}`);
  }
});

// Wylogowanie
document.getElementById("userLogout").addEventListener("click", () => {
  mainSection.style.display = "none";
  choiceSection.style.display = "flex";
  localStorage.removeItem("userId");
});

document.getElementById("editData").addEventListener("click", () => {
  document.getElementById("editButtons").style.display =
    document.getElementById("editButtons").style.display === "flex"
      ? "none"
      : "flex";
  document.getElementById("cosmeticsButtons").style.display = "none";
  document.getElementById("moreOptionsButtons").style.display = "none";
});

document.getElementById("viewCosmetics").addEventListener("click", () => {
  document.getElementById("cosmeticsButtons").style.display =
    document.getElementById("cosmeticsButtons").style.display === "flex"
      ? "none"
      : "flex";
  document.getElementById("editButtons").style.display = "none";
  document.getElementById("moreOptionsButtons").style.display = "none";
});

document.getElementById("moreButton").addEventListener("click", () => {
  document.getElementById("moreOptionsButtons").style.display =
    document.getElementById("moreOptionsButtons").style.display === "flex"
      ? "none"
      : "flex";
  document.getElementById("editButtons").style.display = "none";
  document.getElementById("cosmeticsButtons").style.display = "none";
});
