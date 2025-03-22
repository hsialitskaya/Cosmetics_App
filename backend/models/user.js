const fs = require("fs").promises;
const path = require("path");

const usersFile = path.join(__dirname, "../data/users.json");

// Funkcja do odczytu danych z pliku z obsługą błędów
const getUsers = async () => {
  try {
    const data = await fs.readFile(usersFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Błąd podczas odczytu pliku użytkowników:", error);
    return [];
  }
};

// Funkcja do zapisu danych użytkowników z obsługą błędów
const saveUsers = async (users) => {
  try {
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf-8");
  } catch (error) {
    console.error("Błąd podczas zapisu pliku użytkowników:", error);
  }
};

// Funkcja do wyszukiwania użytkownika po emailu
const findUserByEmail = async (email) => {
  const users = await getUsers();
  return users.find((user) => user.email === email) || null; // Zwróć null, jeśli użytkownik nie został znaleziony
};

// Funkcja do wyszukiwania użytkownika po ID
const findUserById = async (id) => {
  const users = await getUsers();
  return users.find((user) => user.id === Number(id)) || null; // Zwróć null, jeśli użytkownik nie został znaleziony
};

// Funkcja do tworzenia nowego użytkownika
const createUser = async (user) => {
  const users = await getUsers();
  users.push(user);
  await saveUsers(users);
  return user;
};

// Funkcja do aktualizacji danych użytkownika
const updateUser = async (updatedUser) => {
  try {
    const users = await getUsers();
    const index = users.findIndex((user) => user.id === updatedUser.id);

    if (index !== -1) {
      // Aktualizujemy użytkownika
      users[index] = updatedUser;
      await saveUsers(users); // Zapisujemy zaktualizowaną listę
      return true; // Zwracamy true, gdy aktualizacja się powiodła
    } else {
      console.error("Użytkownik nie znaleziony do aktualizacji");
      return false; // Zwracamy false, gdy użytkownik nie został znaleziony
    }
  } catch (error) {
    console.error("Błąd podczas aktualizacji użytkownika:", error);
    return false; // Zwracamy false w przypadku błędu
  }
};

// Funkcja do usuwania użytkownika po ID
const deleteUserById = async (id) => {
  try {
    const users = await getUsers();
    const initialLength = users.length;

    // Filtrujemy użytkowników, aby usunąć tego z podanym id
    const updatedUsers = users.filter((user) => user.id !== Number(id));

    if (updatedUsers.length === initialLength) {
      console.error("Użytkownik o podanym ID nie istnieje");
      return false; // Zwracamy false, gdy użytkownik o podanym ID nie istnieje
    }

    // Zapisujemy zaktualizowaną listę użytkowników
    await saveUsers(updatedUsers);
    return true; // Zwracamy true, gdy usunięcie się powiodło
  } catch (error) {
    console.error("Błąd podczas usuwania użytkownika:", error);
    return false; // Zwracamy false w przypadku błędu
  }
};

module.exports = {
  getUsers,
  saveUsers,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  deleteUserById,
};
