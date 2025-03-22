const WebSocket = require("ws");
const fs = require("fs");
const https = require("https");
const { v4: uuidv4 } = require("uuid");

const privateKey = fs.readFileSync("../tls/klucz_haslo.key", "utf8");
const certificate = fs.readFileSync("../tls/certyfikat.crt", "utf8");

const credentials = { key: privateKey, cert: certificate };
const server = https.createServer(credentials);

const wss = new WebSocket.Server({ server });

// Przechowywanie informacji o użytkownikach i pokojach
let rooms = {};
let clients = [];
let quizRooms = {};

wss.on("connection", (ws) => {
  let user = null;
  let room = null;
  clients.push(ws);
  ws.id = uuidv4();

  // Obsługuje wiadomości
  ws.on("message", (message) => {
    let parsedMessage;

    // Bezpieczne parsowanie wiadomości
    try {
      parsedMessage = JSON.parse(message);
    } catch (error) {
      console.log("Nie udało się sparsować wiadomości:", message);
      return;
    }

    // Obsługuje logowanie i przypisanie do pokoju
    if (parsedMessage.type === "login") {
      user = parsedMessage.username;
      room = parsedMessage.topic;

      // Walidacja danych
      if (!user || !room) {
        console.log("Nieprawidłowe dane logowania:", parsedMessage);
        return;
      }

      // Tworzymy pokój, jeśli jeszcze nie istnieje
      if (!rooms[room]) {
        rooms[room] = [];
      }

      // Dodajemy użytkownika do pokoju
      rooms[room].push(ws);

      ws.room = room;

      // Powiadamiamy innych użytkowników w pokoju
      rooms[room].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "login",
              text: `${user} dołączył do pokoju ${room}`,
              topic: room,
            })
          );
        }
      });
    }

    // Obsługuje wiadomości
    if (parsedMessage.type === "message") {
      user = parsedMessage.sender;
      room = parsedMessage.topic;

      // Walidacja danych
      if (!user || !room) {
        console.log("Nieprawidłowe dane wysyłania wiadomosci", parsedMessage);
        return;
      }
      if (rooms[room]) {
        rooms[room].forEach((client) => {
          // Wysyłamy wiadomość do wszystkich użytkowników w pokoju
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "message",
                text: parsedMessage.text,
                topic: room,
                sender: user,
              })
            );
          }
        });
      }
    }

    // Obsługuje przesyłanie zdjęć
    if (parsedMessage.type === "image") {
      user = parsedMessage.sender;
      room = parsedMessage.topic;

      // Walidacja danych
      if (!user || !room) {
        console.log("Nieprawidłowe dane wysyłania zdjęcia:", parsedMessage);
        return;
      }
      if (rooms[room]) {
        rooms[room].forEach((client) => {
          // Wysyłamy obraz do wszystkich użytkowników w pokoju
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "image",
                image: parsedMessage.image,
                topic: room,
                sender: user,
              })
            );
          }
        });
      }
    }

    // Obsługuje rozłączenie użytkownika
    if (parsedMessage.type === "logout") {
      user = parsedMessage.sender;
      room = parsedMessage.topic;

      // Walidacja danych
      if (!user || !room) {
        console.log("Nieprawidłowe dane wylogowania:", parsedMessage);
        return;
      }

      if (rooms[room]) {
        // Usuwamy użytkownika z pokoju
        rooms[room] = rooms[room].filter((client) => client !== ws);

        // Powiadamiamy pozostałych użytkowników o opuszczeniu pokoju
        rooms[room].forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "logout",
                text: `${user} opuścił pokój ${room}`,
                topic: room,
              })
            );
          }
        });

        // Jeśli pokój jest pusty, usuwamy go
        if (rooms[room].length === 0) {
          delete rooms[room];
        }
      }
      clients = clients.filter((client) => client !== ws);
    }

    // Obsługa dołączania do quizu
    if (parsedMessage.type === "join_quiz") {
      const { username, quiz } = parsedMessage;

      // Tworzymy pokój quizu, jeśli nie istnieje
      if (!quizRooms[quiz]) {
        quizRooms[quiz] = {
          players: [],
          usernames: [],
          place: 0,
        };
      }

      // Dodajemy nowego gracza do pokoju
      quizRooms[quiz].players.push(ws);
      quizRooms[quiz].usernames.push(username);
      ws.quiz = quiz;
      ws.username = username;

      quizRooms[quiz].players.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "player_count",
              players: quizRooms[quiz].usernames,
            })
          );
        }
      });

      // Powiadamiamy wszystkich graczy o nowym graczu
      quizRooms[quiz].players.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "player_joined",
              username,
            })
          );
        }
      });
    }

    if (parsedMessage.type === "start_quiz") {
      const { quiz } = parsedMessage;
      if (quizRooms[quiz]) {
        quizRooms[ws.quiz].players.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "quiz_start",
              })
            );
          }
        });
      }
    }

    if (parsedMessage.type === "quiz_end") {
      const { quiz, finalScore, timeTaken } = parsedMessage;

      // Sprawdzamy, czy pokój quizu istnieje
      if (quizRooms[quiz]) {
        // Zwiększamy miejsce o 1 dla gracza, który zakończył quiz
        quizRooms[quiz].place += 1;
        const place = quizRooms[quiz].place;

        // Usuwamy gracza z listy graczy i nazw użytkowników
        quizRooms[quiz].players = quizRooms[quiz].players.filter(
          (client) => client !== ws
        );
        quizRooms[quiz].usernames = quizRooms[quiz].usernames.filter(
          (username) => username !== ws.username
        );

        // Wysyłamy wynik quizu do gracza
        ws.send(
          JSON.stringify({
            type: "quiz_result",
            finalScore,
            timeTaken,
            place, // Przekazujemy miejsce gracza
          })
        );

        // Jeśli pokój jest pusty, usuwamy go
        if (quizRooms[quiz].usernames.length === 0) {
          delete quizRooms[quiz];
        }
      }
    }

    if (parsedMessage.type === "newCosmetic" && parsedMessage.cosmetic) {
      const { cosmetic } = parsedMessage;

      // Iterowanie po wszystkich klientach i wysyłanie wiadomości
      clients.forEach((client) => {
        // Sprawdzanie, czy połączenie jest otwarte
        if (client.readyState === WebSocket.OPEN) {
          const message = {
            type: "cosmetic",
            text: `✅ Nowość! ✅ Nowy kosmetyk: ${cosmetic.name}, typ: ${cosmetic.type}`,
          };

          try {
            console.log("Wysyłam wiadomość:", message);
            // Wysyłanie wiadomości do klienta
            client.send(JSON.stringify(message));
          } catch (error) {
            console.error(
              "Błąd podczas wysyłania wiadomości do klienta:",
              error
            );
          }
        }
      });
    }
    if (parsedMessage.type === "deleteCosmetic") {
      // Iterowanie po wszystkich klientach i wysyłanie wiadomości
      clients.forEach((client) => {
        // Sprawdzanie, czy połączenie jest otwarte
        if (client.readyState === WebSocket.OPEN) {
          const message = {
            type: "cosmetic",
            text: `❌ Uwaga! ❌ Kosmetyk został usunięty przez administratora`,
          };

          try {
            console.log("Wysyłam wiadomość:", message);
            // Wysyłanie wiadomości do klienta
            client.send(JSON.stringify(message));
          } catch (error) {
            console.error(
              "Błąd podczas wysyłania wiadomości do klienta:",
              error
            );
          }
        }
      });
    }
    if (parsedMessage.type === "feedback") {
      const { time } = parsedMessage;
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "feedback",
              text: `Ankieta została już wypełniona w dniu ${time}, jednak możesz ją zrobić ponownie`,
            })
          );
        }
      });
    }
  });
});

module.exports = {
  wss,
};
