const mqtt = require("mqtt");
const fs = require("fs").promises;
const path = require("path");

const client = mqtt.connect("mqtt://localhost:1883");

const linksPath = path.resolve(__dirname, "./data/info.json");
const usersPath = path.resolve(__dirname, "./data/users.json");
// Asynchroniczne odczytanie pliku
const readLinks = async () => {
  try {
    const data = await fs.readFile(linksPath, "utf8");
    const links = JSON.parse(data);
    return links;
  } catch (error) {
    console.error("Błąd odczytu pliku:", error);
  }
};

const readUsers = async () => {
  try {
    const data = await fs.readFile(usersPath, "utf8");
    const users = JSON.parse(data);
    return users;
  } catch (error) {
    console.error("Błąd odczytu pliku:", error);
  }
};

const feedbackFilePath = path.resolve(__dirname, "./data/feedback.json");

client.on("connect", () => {
  console.log("Connected to MQTT broker");

  client.subscribe("cosmetics/votes", (err) => {
    if (err) {
      console.error("Błąd subskrypcji:", err);
    } else {
      console.log("Subskrypcja na temat 'cosmetics/votes' udana.");
    }
  });

  client.subscribe("cosmetics/skininfo", (err) => {
    if (err) {
      console.error("Błąd subskrypcji:", err);
    } else {
      console.log("Subskrypcja na temat 'cosmetics/skininfo' udana.");
    }
  });

  client.subscribe("app/feedback", (err) => {
    if (err) {
      console.error("Błąd subskrypcji:", err);
    } else {
      console.log("Subskrypcja na temat 'app/feedback' udana.");
    }
  });

  client.subscribe("cosmetics/fav", (err) => {
    if (err) {
      console.error("Błąd subskrypcji:", err);
    } else {
      console.log("Subskrypcja na temat 'cosmetics/fav' udana.");
    }
  });
});

async function publishVote(cosmetic, voteType) {
  const voteData = {
    cosmeticId: cosmetic.id,
    voteType: voteType,
    upVotes: cosmetic.upVotes,
    downVotes: cosmetic.downVotes,
  };

  return new Promise((resolve, reject) => {
    client.publish("cosmetics/votes", JSON.stringify(voteData), (err) => {
      if (err) {
        return reject("Błąd podczas publikowania na MQTT: " + err);
      }
      resolve();
    });
  });
}

async function countVote() {
  return new Promise((resolve, reject) => {
    const handleMessage = (topic, message) => {
      if (topic === "cosmetics/votes") {
        const voteData = JSON.parse(message.toString());
        const upVotes = voteData.upVotes || 0;
        const downVotes = voteData.downVotes || 0;
        const voteDifference = upVotes - downVotes;
        client.removeListener("message", handleMessage); // Usuwamy nasłuchiwacza po otrzymaniu danych
        resolve(voteDifference);
      }
    };

    client.on("message", handleMessage);

    setTimeout(() => {
      client.removeListener("message", handleMessage); // Usuwamy nasłuchiwacza, jeśli timeout
      reject("Timeout oczekiwania na wynik głosowania");
    }, 5000);
  });
}

// Funkcja publikująca dane o skórze
async function publishSkinData(skinData) {
  return new Promise((resolve, reject) => {
    client.publish("cosmetics/skininfo", JSON.stringify(skinData), (err) => {
      if (err) {
        return reject("Błąd podczas publikowania na MQTT: " + err);
      }
      resolve();
    });
  });
}

// Funkcja oczekująca na odpowiedź z linkami
async function fetchSkinLinks() {
  return new Promise((resolve, reject) => {
    client.on("message", async (topic, message) => {
      if (topic === "cosmetics/skininfo") {
        const { skinType, skinIssues } = JSON.parse(message.toString());

        // Walidacja danych wejściowych
        if (!skinType || !skinIssues) {
          console.error("Niepoprawne dane wejściowe");
          return;
        }

        const links = await readLinks();

        // Pobieranie odpowiednich linków
        const info_links = [];

        // Funkcja konwertująca na tablicę, jeśli to pojedynczy string
        const ensureArray = (value) => (Array.isArray(value) ? value : [value]);

        // Konwertowanie skinType i skinIssues na tablice
        const skinTypesArray = ensureArray(skinType);
        const skinIssuesArray = ensureArray(skinIssues);

        // Dodaj link dla typu cery
        skinTypesArray.forEach((type) => {
          if (links[type]) {
            info_links.push({ name: type, link: links[type].link });
          }
        });

        // Dodaj linki dla każdego problemu skórnego
        skinIssuesArray.forEach((issue) => {
          if (links[issue]) {
            info_links.push({ name: issue, link: links[issue].link });
          }
        });

        const info_food = [];

        skinTypesArray.forEach((type) => {
          if (links[type]) {
            info_food.push(links[type].diet_advice);
          }
        });

        skinIssuesArray.forEach((issue) => {
          if (links[issue]) {
            info_food.push(links[issue].diet_advice);
          }
        });

        resolve({ info_links, info_food });
      }
    });
    setTimeout(() => reject("Timeout oczekiwania na info"), 5000); // Dajemy trochę czasu na otrzymanie wyniku
  });
}

// Funkcja do publikowania wiadomości do MQTT
async function publishMessage(message) {
  return new Promise((resolve, reject) => {
    client.publish("app/feedback", message, (err) => {
      if (err) {
        return reject("Błąd podczas publikowania na MQTT: " + err);
      }
      resolve();
    });
  });
}

client.on("message", async (topic, message) => {
  if (topic === "app/feedback") {
    try {
      const feedback = JSON.parse(message.toString());

      // Odczytaj istniejące dane
      let existingData = [];
      try {
        const data = await fs.readFile(feedbackFilePath, "utf-8");
        existingData = JSON.parse(data);
      } catch (err) {
        if (err.code === "ENOENT") {
          // Jeśli plik nie istnieje, inicjalizujemy pustą tablicę
          existingData = [];
        } else {
          throw new Error("Błąd podczas odczytu pliku feedback.json");
        }
      }

      // Dodaj nowe dane
      existingData.push(feedback);

      // Zapisz dane do pliku feedback.json
      await fs.writeFile(
        feedbackFilePath,
        JSON.stringify(existingData, null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error("Błąd podczas obsługi feedbacku:", error.message);
    }
  }
});

// Funkcja publikująca dane o ulubionych kosmetykach
async function publishFav(skinData) {
  return new Promise((resolve, reject) => {
    client.publish("cosmetics/fav", JSON.stringify(skinData), (err) => {
      if (err) {
        return reject("Błąd podczas publikowania na MQTT: " + err);
      }
      resolve();
    });
  });
}

// Funkcja oczekująca na odpowiedź z liczbą polubień
async function countFav() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      client.removeListener("message", messageHandler);
      reject("Timeout oczekiwania na info");
    }, 5000);

    function messageHandler(topic, message) {
      if (topic !== "cosmetics/fav") return;

      try {
        const cosmetics = JSON.parse(message.toString());
        if (!cosmetics) {
          console.error("Niepoprawne dane wejściowe");
          return;
        }

        readUsers()
          .then((users) => {
            const fav = cosmetics.reduce((acc, cosmetic) => {
              const count = users.reduce((userAcc, user) => {
                return Array.isArray(user.favorites) &&
                  user.favorites.includes(cosmetic.id)
                  ? userAcc + 1
                  : userAcc;
              }, 0);

              return { ...acc, [cosmetic.id]: count };
            }, {});

            clearTimeout(timeout);
            client.removeListener("message", messageHandler);
            resolve({ amount: fav });
          })
          .catch((err) => {
            clearTimeout(timeout);
            client.removeListener("message", messageHandler);
            reject("Błąd podczas odczytu użytkowników: " + err);
          });
      } catch (err) {
        clearTimeout(timeout);
        client.removeListener("message", messageHandler);
        reject("Błąd podczas parsowania wiadomości MQTT: " + err);
      }
    }

    client.once("message", messageHandler);
  });
}

module.exports = {
  publishVote,
  countVote,
  publishSkinData,
  fetchSkinLinks,
  publishMessage,
  countFav,
  publishFav,
};
