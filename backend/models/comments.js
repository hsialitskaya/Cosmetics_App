const fs = require("fs").promises;
const path = require("path");

const commentsFile = path.join(__dirname, "../data/comments.json");

// Funkcja do odczytu komentarzy z pliku
const getComments = async () => {
  try {
    const data = await fs.readFile(commentsFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Błąd podczas odczytu pliku komentarzy:", error);
    return []; // Zwracamy pustą tablicę w razie błędu
  }
};

// Funkcja do zapisu komentarzy do pliku
const saveComments = async (comments) => {
  try {
    await fs.writeFile(
      commentsFile,
      JSON.stringify(comments, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Błąd podczas zapisu pliku komentarzy:", error);
  }
};

// Funkcja do wyszukiwania komentarzy po ID kosmetyku
const findCommentById = async (cosmmentId) => {
  const comments = await getComments();
  return comments.find((comment) => comment.id === Number(cosmmentId));
};

// Funkcja do wyszukiwania komentarzy po ID kosmetyku
const findCommentsByCosmeticId = async (cosmeticId) => {
  const comments = await getComments();
  return comments.filter((comment) => comment.cosmeticId === cosmeticId);
};

// Funkcja do wyszukiwania komentarzy po ID użytkownika
const findCommentsByUserId = async (userId) => {
  const comments = await getComments();
  return comments.filter((comment) => comment.userId === userId);
};

// Funkcja do tworzenia nowego komentarza
const createComment = async (comment) => {
  const comments = await getComments();
  comments.push(comment);
  await saveComments(comments);
  return comment;
};

// Funkcja do usuwania komentarza po ID
const deleteCommentById = async (id) => {
  try {
    const comments = await getComments();
    const updatedComments = comments.filter(
      (comment) => comment.id !== Number(id)
    );

    if (updatedComments.length === comments.length) {
      console.error("Nie znaleziono komentarza do usunięcia.");
      return false; // Zwracamy false, jeśli komentarz nie został znaleziony
    }

    await saveComments(updatedComments); // Zapisujemy zaktualizowaną listę
    return true; // Zwracamy true, gdy usunięcie się powiodło
  } catch (error) {
    console.error("Błąd podczas usuwania komentarza:", error);
    return false;
  }
};

// Funkcja do aktualizacji komentarza
const updateComment = async (updatedComment) => {
  try {
    const comments = await getComments();
    const index = comments.findIndex(
      (comment) => comment.id === updatedComment.id
    );

    if (index !== -1) {
      // Aktualizujemy komentarz
      comments[index] = updatedComment;
      await saveComments(comments); // Zapisujemy zaktualizowaną listę
      return true; // Zwracamy true, gdy aktualizacja się powiodła
    } else {
      console.error("Komentarz nie znaleziony do aktualizacji");
      return false; // Zwracamy false, gdy komentarz nie został znaleziony
    }
  } catch (error) {
    console.error("Błąd podczas aktualizacji komentarza:", error);
    return false; // Zwracamy false w przypadku błędu
  }
};

module.exports = {
  getComments,
  saveComments,
  findCommentById,
  findCommentsByCosmeticId,
  findCommentsByUserId,
  createComment,
  deleteCommentById,
  updateComment,
};
