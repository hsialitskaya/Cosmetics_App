const express = require("express");
const Comment = require("../models/comments");
const User = require("../models/user");
const router = express.Router();

// Dodawanie nowego komentarza
router.post("/comments", async (req, res) => {
  const { cosmeticId, userId, commentText, rating } = req.body;

  // Walidacja danych
  if (!cosmeticId || !commentText || !userId) {
    return res.status(400).json({ message: "Brak wymaganych danych" });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Ocena musi być liczbą od 1 do 5" });
  }

  // Pobieramy użytkowników z pliku
  const users = await User.getUsers();
  const user = users.find((u) => u.id === Number(userId));

  if (!user) {
    return res
      .status(400)
      .json({ message: "Użytkownik nie został znaleziony" });
  }

  // Tworzenie nowego komentarza
  try {
    const newComment = await Comment.createComment({
      id: Date.now(),
      cosmeticId,
      userId,
      user: `${user.firstName} ${user.lastName}`,
      comment: commentText,
      rating,
    });

    // Dodanie danych użytkownika do odpowiedzi
    res.status(201).json({
      message: "Komentarz został dodany",
      comment: newComment,
      user: `${user.firstName} ${user.lastName}`,
    });
  } catch (error) {
    console.error("Błąd przy dodawaniu komentarza: ", error);
    res
      .status(500)
      .json({ message: "Wystąpił błąd przy dodawaniu komentarza" });
  }
});

// Pobieranie komentarzy dla konkretnego kosmetyku
router.get("/comments/:cosmeticId", async (req, res) => {
  const { cosmeticId } = req.params;

  try {
    const comments = await Comment.findCommentsByCosmeticId(cosmeticId);
    res.status(200).json(comments);
  } catch (error) {
    console.error("Błąd przy pobieraniu komentarzy: ", error);
    res
      .status(500)
      .json({ message: "Wystąpił błąd przy pobieraniu komentarzy" });
  }
});

// Usuwanie komentarza po ID
router.delete("/comments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Comment.deleteCommentById(id);

    if (deleted) {
      res.status(200).json({ message: "Komentarz został usunięty" });
    } else {
      res.status(404).json({ message: "Komentarz nie został znaleziony" });
    }
  } catch (error) {
    console.error("Błąd przy usuwaniu komentarza: ", error);
    res.status(500).json({ message: "Wystąpił błąd przy usuwaniu komentarza" });
  }
});

// Aktualizowanie komentarza
router.put("/comments/:id", async (req, res) => {
  const { id } = req.params;
  const { commentText, rating } = req.body;

  // Walidacja danych
  if (!commentText || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ message: "Niepoprawne dane (treść lub ocena)" });
  }

  try {
    const currentComment = await Comment.findCommentById(id);

    if (!currentComment) {
      return res
        .status(404)
        .json({ message: "Komentarz nie został znaleziony" });
    }

    const updatedMessage = {
      id: Number(id),
      comment: commentText,
      rating,
      cosmeticId: currentComment.cosmeticId,
      userId: currentComment.userId,
      user: currentComment.user,
    };

    const updated = await Comment.updateComment(updatedMessage);

    if (updated) {
      res.status(200).json({ message: "Komentarz został zaktualizowany" });
    } else {
      res.status(404).json({ message: "Komentarz nie został znaleziony" });
    }
  } catch (error) {
    console.error("Błąd przy aktualizowaniu komentarza: ", error);
    res
      .status(500)
      .json({ message: "Wystąpił błąd przy aktualizowaniu komentarza" });
  }
});

module.exports = router;
