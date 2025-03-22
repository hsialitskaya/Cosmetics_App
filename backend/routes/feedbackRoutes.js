const express = require("express");
const router = express.Router();

const { publishMessage } = require("../mqttServer");

// Endpoint do wysyłania odpowiedzi do MQTT feedback
router.post("/feedback/answers", async (req, res) => {
  const { userId, answers } = req.body;

  // Walidacja danych wejściowych
  if (!userId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: "Niepoprawne dane wejściowe" });
  }

  const feedback = {
    userId: userId,
    answers: answers,
    timestamp: new Date().toLocaleDateString(),
  };

  try {
    // Publikowanie wiadomości z prawidłowym JSON-em
    await publishMessage(JSON.stringify(feedback));
    res.status(201).json({ message: "Odpowiedzi zostały przesłane" });
  } catch (error) {
    console.error("Błąd podczas publikowania odpowiedzi do MQTT:", error);
    res.status(500).json({ message: "Błąd podczas przesyłania odpowiedzi" });
  }
});

module.exports = router;
