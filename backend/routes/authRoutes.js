const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const router = express.Router();
const logger = require("../models/logger");

// Rejestracja nowego użytkownika
router.post("/register", async (req, res) => {
  const { firstName, lastName, age, email, password } = req.body;

  // Walidacja formatu emaila
  if (!/\S+@\S+\.\S+/.test(email)) {
    logger.warn(`Invalid email format: ${email}`);
    return res.status(400).json({ message: "Niepoprawny format emaila" });
  }

  // Walidacja hasła (np. minimalna długość 10 znaków)
  if (password.length < 10) {
    logger.warn(`Password too short for email: ${email}`);
    return res
      .status(400)
      .json({ message: "Hasło musi mieć co najmniej 10 znaków" });
  }

  // Sprawdzenie, czy użytkownik już istnieje
  const existingUser = await User.findUserByEmail(email);
  if (existingUser) {
    logger.warn(`Email already exists: ${email}`);
    return res.status(400).json({ message: "Email już istnieje" });
  }

  // Haszowanie hasła
  const hashedPassword = await bcrypt.hash(password, 10); // Liczba oznaczająca koszt obliczeniowy (cost factor), czyli liczbę rund służących do zwiększenia złożoności algorytmu.

  // Tworzenie nowego użytkownika
  try {
    const newUser = await User.createUser({
      id: Date.now(),
      firstName,
      lastName,
      age,
      email,
      password: hashedPassword,
    });

    logger.info(`User registered successfully: ${newUser.email}`);

    // Zwrócenie odpowiedzi po utworzeniu użytkownika
    res.status(201).json({
      message: "Użytkownik został zarejestrowany",
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        age: newUser.age,
        email: newUser.email,
      },
    });
  } catch (error) {
    logger.error("Error creating user: " + error.message);
    console.error("Błąd przy tworzeniu użytkownika: ", error);
    res.status(500).json({ message: "Wystąpił błąd przy rejestracji" });
  }
});

// Logowanie istniejącego użytkownika
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Sprawdzenie, czy użytkownik istnieje
  const user = await User.findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    logger.warn(`Failed login attempt for email: ${email}`);
    return res.status(400).json({ message: "Nieprawidłowe dane" });
  }

  logger.info(`User logged in successfully: ${email}`);

  return res.status(200).json({
    message: "Logowanie udane",
    user: { id: user.id, email: user.email },
  });
});

module.exports = router;
