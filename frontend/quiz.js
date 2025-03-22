import socket from "./websocket.js";

const quizzes = [
  {
    name: "Podstawy pielęgnacji skóry",
    questions: [
      {
        question: "Jaki produkt najlepiej oczyszcza skórę twarzy?",
        answers: ["Płyn micelarny", "Woda różana", "Krem nawilżający"],
        correctAnswer: "Płyn micelarny",
      },
      {
        question:
          "Jakie składniki w kremach przeciwzmarszczkowych są najskuteczniejsze?",
        answers: [
          "Kwas hialuronowy i retinol",
          "Alkohol i paraben",
          "Olejki roślinne",
        ],
        correctAnswer: "Kwas hialuronowy i retinol",
      },
      {
        question: "Co powinno się stosować w celu nawilżenia suchej skóry?",
        answers: [
          "Kremy z kwasem hialuronowym",
          "Żele oczyszczające",
          "Toniki z alkoholem",
        ],
        correctAnswer: "Kremy z kwasem hialuronowym",
      },
    ],
  },
  {
    name: "Kosmetyki nawilżające",
    questions: [
      {
        question: "Jaki składnik kosmetyków najlepiej nawilża skórę?",
        answers: ["Kwas hialuronowy", "Alkohol", "Silikony"],
        correctAnswer: "Kwas hialuronowy",
      },
      {
        question:
          "Co warto stosować na noc, aby zapewnić skórze głębokie nawilżenie?",
        answers: ["Serum nawilżające", "Mocny tonik z alkoholem", "Podkład"],
        correctAnswer: "Serum nawilżające",
      },
      {
        question:
          "Jakie produkty najlepiej chronią przed utratą wilgoci w skórze?",
        answers: [
          "Kremy z ceramidami",
          "Żele do twarzy",
          "Tłuste oleki mineralne",
        ],
        correctAnswer: "Kremy z ceramidami",
      },
    ],
  },
  {
    name: "Kosmetyki ochronne",
    questions: [
      {
        question: "Co jest najważniejsze w kosmetyku ochronnym przed słońcem?",
        answers: ["SPF", "Witamina C", "Alkohol"],
        correctAnswer: "SPF",
      },
      {
        question:
          "Jakie substancje pomagają w ochronie skóry przed szkodliwym promieniowaniem UV?",
        answers: [
          "Ochronne filtry przeciwsłoneczne",
          "Perfumy",
          "Tlenek cynku",
        ],
        correctAnswer: "Ochronne filtry przeciwsłoneczne",
      },
      {
        question:
          "Jaki kosmetyk powinno się stosować codziennie, aby chronić skórę przed słońcem?",
        answers: [
          "Krem przeciwsłoneczny",
          "Żel oczyszczający",
          "Puder do twarzy",
        ],
        correctAnswer: "Krem przeciwsłoneczny",
      },
    ],
  },
];

let username;
let selectedQuiz;
let startTime;
let players = [];
let countdownTimer;
let currentQuestionIndex = 0;
let score = 0;

// Pobranie userId z localStorage
const userId = localStorage.getItem("userId");

// Pobranie danych użytkownika
const getUserData = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Błąd pobierania danych użytkownika");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
  }
};

// Funkcja do wypełnienia listy quizów
function populateQuizList() {
  const quizSelect = document.getElementById("quiz");
  quizzes.forEach((quiz) => {
    const option = document.createElement("option");
    option.value = quiz.name;
    option.textContent = quiz.name;
    quizSelect.appendChild(option);
  });
}

// Dołączenie do quizu
async function joinQuiz() {
  selectedQuiz = document.getElementById("quiz").value;
  if (!userId || !selectedQuiz) {
    alert("Brak wymaganych danych.");
    return;
  }

  const userData = await getUserData(userId);
  if (userData) {
    username = `${userData.firstName} ${userData.lastName}`;
  }

  socket.send(
    JSON.stringify({ type: "join_quiz", username, quiz: selectedQuiz })
  );

  document.getElementById("quizSelection").style.display = "none";
  document.getElementById("waitingRoom").style.display = "flex";
}

// Obsługa WebSocket
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === "player_count") {
    players = message.players;
  } else if (message.type === "player_joined") {
    updateWaitingRoom();
    if (players.length >= 2 && !countdownTimer) {
      startCountdown();
    }
  } else if (message.type === "quiz_start") {
    startQuiz();
  } else if (message.type === "quiz_result") {
    displayQuizResult(message.finalScore, message.timeTaken, message.place);
  }
};

// Aktualizacja ekranu poczekalni
function updateWaitingRoom() {
  const playersList = document.getElementById("playersList");
  playersList.innerHTML = "<strong>Lista graczy:</strong>";
  players.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = player;
    playersList.appendChild(li);
  });
}

// 1-minutowe odliczanie przed startem quizu
function startCountdown() {
  let timeLeft = 10;
  const countdownElement = document.getElementById("countdown");

  countdownTimer = setInterval(() => {
    countdownElement.textContent = `Quiz rozpocznie się za ${timeLeft} sekund...`;
    if (timeLeft === 0) {
      clearInterval(countdownTimer);
      socket.send(JSON.stringify({ type: "start_quiz", quiz: selectedQuiz }));
    }
    timeLeft--;
  }, 1000);
}

// Rozpoczęcie quizu
function startQuiz() {
  document.getElementById("waitingRoom").style.display = "none";
  document.getElementById("quizGame").style.display = "flex";
  startTime = Date.now(); // Zapisanie czasu rozpoczęcia quizu
  displayNextQuestion();
  clearInterval(countdownTimer);
  countdownTimer = null;
  document.getElementById("countdown").textContent = "";
}

// Wyświetlanie pytania
function displayQuestion(questionText, answers) {
  const questionElement = document.getElementById("question");
  const answersContainer = document.getElementById("answers");
  answersContainer.innerHTML = "";

  questionElement.textContent = questionText;

  answers.forEach((answer) => {
    const button = document.createElement("button");
    button.textContent = answer;
    button.classList.add("answer-button");
    button.onclick = () => checkAnswer(answer);
    answersContainer.appendChild(button);
  });
}

// Sprawdzenie odpowiedzi
function checkAnswer(answer) {
  const currentQuiz = quizzes.find((quiz) => quiz.name === selectedQuiz);
  const currentQuestion = currentQuiz.questions[currentQuestionIndex];

  if (answer === currentQuestion.correctAnswer) {
    score++;
  }

  currentQuestionIndex++;
  if (currentQuestionIndex < currentQuiz.questions.length) {
    displayNextQuestion();
  } else {
    endQuiz();
  }
}

// Wyświetlanie następnego pytania
function displayNextQuestion() {
  const currentQuiz = quizzes.find((quiz) => quiz.name === selectedQuiz);
  const nextQuestion = currentQuiz.questions[currentQuestionIndex];
  displayQuestion(nextQuestion.question, nextQuestion.answers);
}

// Zakończenie quizu
function endQuiz() {
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  socket.send(
    JSON.stringify({
      type: "quiz_end",
      quiz: selectedQuiz,
      finalScore: score,
      timeTaken,
    })
  );
  resetQuizState();
}

// Wyświetlanie wyniku końcowego
function displayQuizResult(finalScore, timeTaken, place) {
  document.getElementById("quizGame").style.display = "none";
  const resultElement = document.getElementById("quizResult");
  resultElement.innerHTML = `Ukończyłeś test jako ${place}!<br>Twój wynik: ${finalScore} punktów!<br>Czas ukończenia: ${timeTaken} sekund`;

  document.getElementById("quizEnd").style.display = "flex";
}

// Obsługa przycisków

document.getElementById("quizButton").addEventListener("click", function () {
  mainSection.style.display = "none";
  document.getElementById("quizSelection").style.display = "flex";
});

document.getElementById("joinQuizButton").addEventListener("click", joinQuiz);

document.getElementById("backToMainFromQuiz").addEventListener("click", () => {
  document.getElementById("quizSelection").style.display = "none";
  mainSection.style.display = "flex";
});

// Resetowanie stanu quizu
document
  .getElementById("backToMainFromQuizEnd")
  .addEventListener("click", () => {
    document.getElementById("quizEnd").style.display = "none";
    document.getElementById("quizSelection").style.display = "flex";
    resetQuizState();
  });

function resetQuizState() {
  currentQuestionIndex = 0;
  score = 0;
  players = []; // Resetuj listę graczy
  document.getElementById("playersList").innerHTML = ""; // Wyczyść listę graczy
}

// Inicjalizacja listy quizów po załadowaniu strony
window.onload = () => {
  populateQuizList();
};
