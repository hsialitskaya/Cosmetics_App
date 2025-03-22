import socket from "./websocket.js";
import {
  trackDiscussionVisit,
  displayVisitedDiscussions,
} from "./cookies_components.js";

let username;
let topic;
let cookies;

const userId = localStorage.getItem("userId");
topic = document.getElementById("topic").value;

// Funkcja pobierania danych użytkownika
const getUserData = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Response error data:", errorData);
      throw new Error(
        errorData.message || "Błąd pobierania danych użytkownika"
      );
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error in getUserData function:", error);
    throw error;
  }
};

document.getElementById("chatButton").addEventListener("click", function () {
  document.getElementById("mainSection").style.display = "none";
  document.getElementById("chatSection").style.display = "flex";

  if (!userId) {
    alert("Brak identyfikatora użytkownika.");
    return;
  }

  getUserData(userId).then((userData) => {
    if (userData) {
      // Przypisz dane użytkownika
      username = `${userData.firstName} ${userData.lastName}`;
      cookies = userData.cookiesConsent;

      if (cookies) {
        displayVisitedDiscussions(userId);
      }
    } else {
      console.error("Brak danych użytkownika");
    }
  });
});

function goToLogin() {
  document.getElementById("mainSection").style.display = "flex";
  document.getElementById("chatSection").style.display = "none";
  document.getElementById("chat").style.display = "none";
}

function goToChats() {
  document.getElementById("chatSection").style.display = "flex";
  document.getElementById("chat").style.display = "none";
  if (cookies) {
    displayVisitedDiscussions(userId);
  }

  const message = {
    type: "logout",
    sender: username,
    topic: topic,
  };
  socket.send(JSON.stringify(message));
}

function joinRoom() {
  topic = document.getElementById("topic").value;

  if (!username || !topic) {
    alert("Brak wymaganych danych.");
    return;
  }

  // Wysyłanie wiadomości logowania
  const loginMessage = {
    type: "login",
    username: username,
    topic: topic,
  };
  socket.send(JSON.stringify(loginMessage));

  if (cookies) {
    trackDiscussionVisit(userId, topic);
  }

  // Zmiana widoku po dołączeniu do pokoju
  document.getElementById("chatSection").style.display = "none";
  document.getElementById("chat").style.display = "flex";

  createChatBox(topic);

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.topic === topic) {
      if (message.type === "message") {
        addMessageToChat(message.text, message.sender, "recipient");
      } else if (message.type === "image") {
        addImageToChat(message.image, message.sender, "recipient");
      } else if (message.type === "login") {
        addLoginToChat(message.text);
      } else if (message.type === "logout") {
        addLoginToChat(message.text);
      }
    }
  };
}

function createChatBox(topic) {
  const chatContainer = document.getElementById("chat-container");
  const roomChatBoxId = `chat-box-${topic}`;
  let roomChatBox = document.getElementById(roomChatBoxId);

  if (!roomChatBox) {
    roomChatBox = document.createElement("div");
    roomChatBox.id = roomChatBoxId;
    roomChatBox.classList.add("chat-box");
    // Tworzenie nagłówka dla chatu
    const chatTitle = document.createElement("h3");
    chatTitle.textContent = `💬Czat: ${topic}`; // Tytuł chatu
    chatTitle.classList.add("chat-title");

    // Dodajemy nagłówek do chatBoxa
    roomChatBox.appendChild(chatTitle);
    chatContainer.appendChild(roomChatBox);
  }

  const allChats = document.querySelectorAll(".chat-box");
  allChats.forEach((chat) => (chat.style.display = "none"));
  roomChatBox.style.display = "block";
}

function addMessageToChat(text, sender, who) {
  const chatBox = document.getElementById(`chat-box-${topic}`);
  if (!chatBox) {
    console.error("Nie znaleziono chat-box dla pokoju:", topic);
    return;
  }

  const messageElement = document.createElement("p");
  messageElement.classList.add("message");

  if (who === "sender") {
    messageElement.classList.add("message-sender");
  } else {
    messageElement.classList.add("message-recipient");
  }

  messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addLoginToChat(text) {
  const chatBox = document.getElementById(`chat-box-${topic}`);
  if (!chatBox) {
    console.error("Nie znaleziono chat-box dla pokoju:", topic);
    return;
  }

  const messageElement = document.createElement("p");
  messageElement.classList.add("message");
  messageElement.classList.add("message-recipient");
  messageElement.innerHTML = `${text}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addImageToChat(imageData, sender, who) {
  const chatBox = document.getElementById(`chat-box-${topic}`);
  if (!chatBox) {
    console.error("Nie znaleziono chat-box dla pokoju:", topic);
    return;
  }

  const contentElement = document.createElement("div");
  contentElement.classList.add(
    who === "sender" ? "image-sender" : "image-recipient"
  );

  const imageElement = document.createElement("img");
  imageElement.src = imageData;
  imageElement.alt = `Obraz wysłany przez ${sender}`;

  const caption = document.createElement("p");
  caption.innerHTML = `<strong>${sender}:</strong>`;
  caption.style.marginBottom = "5px";

  contentElement.appendChild(caption);
  contentElement.appendChild(imageElement);
  chatBox.appendChild(contentElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
  const messageText = document.getElementById("message").value;
  if (!messageText) return;

  addMessageToChat(messageText, username, "sender");

  const message = {
    type: "message",
    text: messageText,
    sender: username,
    topic: topic,
  };
  socket.send(JSON.stringify(message));

  document.getElementById("message").value = "";
}

function sendImage() {
  const imageInput = document.getElementById("imageInput");
  const file = imageInput.files[0];

  if (!file) {
    alert("Proszę wybrać plik do wysłania.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const imageData = reader.result;

    addImageToChat(imageData, username, "sender");

    const message = {
      type: "image",
      image: imageData,
      sender: username,
      topic: topic,
    };
    socket.send(JSON.stringify(message));
  };

  reader.readAsDataURL(file);
}

document.getElementById("joinRoomButton").addEventListener("click", joinRoom);
document
  .getElementById("backToMainFromChat")
  .addEventListener("click", goToLogin);

document.getElementById("sendMessage").addEventListener("click", sendMessage);
document.getElementById("sendImage").addEventListener("click", sendImage);
document
  .getElementById("backToChatsFromChat")
  .addEventListener("click", goToChats);
