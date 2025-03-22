// Funkcja do dodawania komentarza
const addComment = async (cosmeticId, userId, commentText, rating) => {
  try {
    const response = await fetch(`${API_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cosmeticId,
        userId,
        commentText: commentText,
        rating: parseInt(rating, 10),
      }),
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || `Błąd: ${response.statusText}`);
    }

    const comment = await response.json();
    alert(comment.message || "Komentarz został zapisany.");
    return comment; // Zwróć dane odpowiedzi
  } catch (error) {
    console.error("Błąd podczas dodawania komentarza:", error);
    alert(`Nie udało się dodać komentarza: ${error.message}`);
  }
};

// Funkcja do pobierania komentarzy dla danego kosmetyku
const getComments = async (cosmeticId) => {
  try {
    const response = await fetch(`${API_URL}/comments/${cosmeticId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || `Błąd: ${response.statusText}`);
    }

    const comments = await response.json();
    renderComments(comments); // Wywołaj renderowanie komentarzy po pobraniu
  } catch (error) {
    console.error("Błąd podczas pobierania komentarzy:", error);
    alert(`Nie udało się pobrać komentarzy: ${error.message}`);
  }
};

// Funkcja do aktualizacji komentarza
const editComment = async (cosmeticId, commentId) => {
  let commentText = prompt("Wprowadź nową treść komentarza:");

  // Pętla, która prosi o ponowne wprowadzenie treści komentarza, jeśli jest pusta
  while (!commentText) {
    alert("Treść komentarza nie może być pusta.");
    commentText = prompt("Wprowadź nową treść komentarza:");
  }

  // Jeżeli komentarz został wprowadzony, przejdź do wprowadzenia oceny
  let rating = null;

  if (commentText) {
    rating = prompt("Wprowadź ocenę (1-5):");

    // Pętla, która sprawdza, czy ocena jest liczbą od 1 do 5
    while (!rating || rating < 1 || rating > 5) {
      alert("Ocena musi być liczbą od 1 do 5.");
      rating = prompt("Wprowadź ocenę (1-5):");
    }
  }

  // Wywołanie API do aktualizacji komentarza, tylko jeśli zarówno komentarz, jak i ocena są poprawne
  if (commentText && rating && rating >= 1 && rating <= 5) {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentText,
          rating: parseInt(rating, 10),
        }),
      });

      const data = await response.json();

      alert(data.message);

      // Wywołanie funkcji, aby pobrać zaktualizowane komentarze
      await getComments(cosmeticId);
    } catch (error) {
      console.error("Błąd przy edytowaniu komentarza:", error);
      alert(`Błąd przy edytowaniu komentarza: ${error.message}`);
    }
  }
};

// Funkcja do usunięcia komentarza
const deleteComment = async (cosmeticId, commentId) => {
  const confirmDelete = confirm("Czy na pewno chcesz usunąć ten komentarz?");
  if (!confirmDelete) {
    return;
  }

  try {
    // Wywołanie API do usunięcia komentarza
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    alert(data.message);

    // Wywołanie funkcji, aby pobrać zaktualizowane komentarze
    await getComments(cosmeticId);
  } catch (error) {
    console.error("Błąd przy usuwaniu komentarza:", error);
    alert(`Błąd przy usuwaniu komentarza: ${error.message}`);
  }
};

// Funkcja do renderowania komentarzy na stronie
const renderComments = (comments) => {
  const commentList = document.getElementById("commentsList"); // Lista, w której będą wyświetlane poszczególne komentarze

  if (!commentList) {
    console.error("Element 'commentList' nie istnieje na stronie.");
    return;
  }

  // Czyścimy listę komentarzy przed dodaniem nowych
  commentList.innerHTML = "";

  // Jeśli brak komentarzy, wyświetlamy komunikat
  if (comments.length === 0) {
    const noCommentsMessage = document.createElement("p");
    noCommentsMessage.textContent = "Brak komentarzy dla tego kosmetyku.";
    commentList.appendChild(noCommentsMessage);
  } else {
    // Iteracja przez komentarze i tworzenie elementów HTML
    comments.forEach((comment) => {
      const commentItem = document.createElement("div");
      commentItem.classList.add("comment-item");

      const commentButtons = document.createElement("div");
      commentButtons.classList.add("comment-buttons");

      const commentUser = document.createElement("strong");
      commentUser.textContent = `🎀 Użytkownik ${comment.user} 🎀`;

      const commentText = document.createElement("p");
      commentText.textContent = `Komentarz: ${comment.comment}`;

      const commentRating = document.createElement("span");
      commentRating.textContent = `Ocena: ${comment.rating}`;

      // Jeśli użytkownik jest autorem komentarza, wyświetl przyciski edycji i usuwania
      const userId = localStorage.getItem("userId");
      if (comment.userId === userId) {
        const editButton = document.createElement("button");
        editButton.textContent = "Edytuj";
        editButton.addEventListener("click", () =>
          editComment(comment.cosmeticId, comment.id)
        );

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Usuń";
        deleteButton.addEventListener("click", () =>
          deleteComment(comment.cosmeticId, comment.id)
        );

        commentButtons.appendChild(editButton);
        commentButtons.appendChild(deleteButton);
      }

      // Dodanie elementów do kontenera komentarza
      commentItem.appendChild(commentUser);
      commentItem.appendChild(commentText);
      commentItem.appendChild(commentRating);
      commentItem.appendChild(commentButtons);

      // Dodanie komentarza do listy
      commentList.appendChild(commentItem);
    });
  }
};

// Obsługuje wysyłanie formularza komentarzy
document.getElementById("commentForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Zapobiega odświeżeniu strony

  const userId = localStorage.getItem("userId"); // Pobierz identyfikator użytkownika z localStorage
  if (!userId) {
    alert("Musisz być zalogowany, aby dodać komentarz.");
    return;
  }

  const cosmeticId = document
    .getElementById("commentForm")
    .getAttribute("data-cosmetic-id");

  const commentText = document.getElementById("comment").value;

  const rating = document.getElementById("rating").value;

  if (!commentText || !rating) {
    alert("Proszę uzupełnić wszystkie pola.");
    return;
  }

  try {
    // Dodanie komentarza za pomocą funkcji
    await addComment(cosmeticId, userId, commentText, rating);

    // Reset formularza po dodaniu komentarza
    document.getElementById("commentForm").reset();
    await getComments(cosmeticId);
  } catch (error) {
    console.error("Błąd podczas zapisywania komentarza:", error);
  }
});

// Obsługuje przycisk powrotu do sekcji kosmetyków z sekcji komentarzy
document
  .getElementById("backToCosmeticsFromComment")
  .addEventListener("click", function () {
    document.getElementById("cosmeticsMenu").style.display = "flex";
    document.getElementById("commentSection").style.display = "none";
  });
