const express = require("express");
const Admin = require("../models/admin");
const router = express.Router();
const logger = require("../models/logger");

// Logowanie admina
router.post("/login", async (req, res) => {
  const { login, password } = req.body;

  // Pobranie wszystkich administratorów z pliku
  const admins = await Admin.getAdmins();

  // Sprawdzenie, czy użytkownik o podanym loginie i haśle istnieje
  const admin = admins.find(
    (admin) => admin.login === login && admin.password === password
  );

  if (!admin) {
    logger.warn(`Failed login as an admin`);
    return res.status(400).json({ message: "Nieprawidłowe dane" });
  }

  logger.info(`User logged in successfully as an admin`);

  return res.status(200).json({
    message: "Logowanie udane",
  });
});

module.exports = router;
