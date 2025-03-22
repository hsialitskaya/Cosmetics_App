import socket from "./websocket.js";

// Funkcja do wysyłania odpowiedzi z ankiety na API
const submitSurveyAnswers = async (userId) => {
  const improvementIdeas = document
    .getElementById("improvementIdeas")
    .value.trim();
  const rating = document.getElementById("rating").value;
  const mostImportantFeature = document.getElementById(
    "mostImportantFeature"
  ).value;
  const problemsFaced = document.getElementById("problemsFaced").value.trim();

  // Pobieranie zaznaczonych opcji z pytania wielokrotnego wyboru
  const likedFeatures = Array.from(
    document.querySelectorAll('input[name="likedFeatures"]:checked')
  ).map((input) => input.value);

  if (!improvementIdeas && !problemsFaced && likedFeatures.length === 0) {
    alert("Proszę odpowiedzieć na przynajmniej jedno pytanie.");
    return;
  }

  const feedback = {
    userId: userId,
    answers: [
      {
        question: "Co chciałbyś/chciałabyś zmienić lub dodać w aplikacji?",
        answer: improvementIdeas,
      },
      { question: "Jak oceniasz naszą aplikację w skali 1-5?", answer: rating },
      {
        question: "Jakie funkcje najbardziej Ci się podobają?",
        answer: likedFeatures,
      },
      {
        question: "Co jest dla Ciebie najważniejsze w aplikacji?",
        answer: mostImportantFeature,
      },
      {
        question:
          "Czy napotkałeś/aś jakieś problemy podczas korzystania z aplikacji?",
        answer: problemsFaced,
      },
    ],
  };

  try {
    const response = await fetch(`${API_URL}/feedback/answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      throw new Error("Błąd podczas przesyłania odpowiedzi.");
    }

    const result = await response.json();
    alert(result.message);
    document.getElementById("questionnaireForm").reset();
    document.getElementById("mainSection").style.display = "flex";
    document.getElementById("questionnaireSection").style.display = "none";
  } catch (error) {
    console.error("Błąd:", error);
    alert("Wystąpił błąd podczas przesyłania odpowiedzi.");
  }
};

// Funkcja do wyświetlania formularza ankiety
const showSurveyForm = () => {
  document.getElementById("mainSection").style.display = "none";
  document.getElementById("questionnaireSection").style.display = "flex";
};

// Przycisk do wyświetlenia formularza ankiety
document
  .getElementById("feedbackButton")
  .addEventListener("click", function () {
    showSurveyForm();
  });

// Przycisk do wysłania odpowiedzi z ankiety
document
  .getElementById("submitQuestionnaire")
  .addEventListener("click", function (event) {
    event.preventDefault();
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("Brak identyfikatora użytkownika.");
      return;
    }

    submitSurveyAnswers(userId);
    socket.send(
      JSON.stringify({
        type: "feedback",
        time: new Date().toLocaleDateString(),
      })
    );
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "feedback") {
        const messagesContainer = document.getElementById(
          "temporaryInfoContainer"
        );
        messagesContainer.textContent = message.text;
      }
    };
  });

// Przycisk powrotu do głównej sekcji
document
  .getElementById("backToMainFromQuestionnaire")
  .addEventListener("click", function () {
    document.getElementById("questionnaireSection").style.display = "none";
    document.getElementById("mainSection").style.display = "flex";
  });
