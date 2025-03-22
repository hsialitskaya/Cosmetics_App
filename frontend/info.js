// Funkcja do pobierania linków do cery
const getInfoLinks = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/skin?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Błąd: ${response.statusText}`);
    }

    const { info } = await response.json();
    return info;
  } catch (error) {
    console.error("Błąd podczas pobierania danych o cerze:", error);
    alert("Nie udało się pobrać danych o cerze.");
    return [];
  }
};

// Funkcja do aktualizacji listy linków w HTML
const updateInfoLinks = async (userId) => {
  const info = await getInfoLinks(userId);
  const links = info.info_links;
  const infoLinksList = document.getElementById("infoLinks");

  infoLinksList.innerHTML = "";

  if (links.length === 0) {
    infoLinksList.innerHTML = "<li>Brak dostępnych linków</li>";
    return;
  }

  links.forEach((link) => {
    const listItem = document.createElement("li");
    const anchor = document.createElement("a");
    anchor.href = link.link;
    anchor.textContent = link.name;
    anchor.target = "_blank";
    listItem.appendChild(anchor);
    infoLinksList.appendChild(listItem);
  });
};

// Funkcja do generowania pliku PDF z dietami
const downloadFoodPDF = (food) => {
  const jsPDF = window.jspdf.jsPDF;
  const doc = new jsPDF();

  doc.setFont("helvetica", "normal");
  // Ustawienia stylu
  const initialFontSize = 16;
  const lineHeight = initialFontSize * 1.2; // Dynamiczny odstęp
  doc.setFontSize(initialFontSize);
  doc.setTextColor(0, 0, 0);

  // Dodaj kolorowe tło
  doc.setFillColor(255, 204, 229);
  doc.rect(
    0,
    0,
    doc.internal.pageSize.width,
    doc.internal.pageSize.height,
    "F"
  );

  // Tytuł
  doc.text("List of diets:", 10, 10); // Uwzględnij wysokość tekstu

  let yPosition = 25; // Start poniżej tytułu
  const margin = 10;
  const pageWidth = doc.internal.pageSize.width;
  const textWidth = pageWidth - 2 * margin;

  if (!food || food.length === 0) {
    doc.text("Brak dostępnych diet.", margin, yPosition);
  } else {
    food.forEach((diet, index) => {
      // Resetuj styl po nowej stronie
      const checkPage = () => {
        if (yPosition > doc.internal.pageSize.height - 20) {
          doc.addPage();
          doc.setFillColor(230, 230, 255);
          doc.rect(
            0,
            0,
            doc.internal.pageSize.width,
            doc.internal.pageSize.height,
            "F"
          );
          doc.setFontSize(initialFontSize);
          doc.setTextColor(0, 0, 0);
          yPosition = 10;
        }
      };

      const fullText = `${index + 1}. ${diet}`;
      let words = fullText.split(" ");
      let currentLine = "";

      while (words.length > 0) {
        checkPage(); // Sprawdź czy potrzebna nowa strona
        const word = words.shift();
        const testLine = currentLine + (currentLine === "" ? "" : " ") + word;
        if (doc.getTextWidth(testLine) < textWidth) {
          currentLine = testLine;
        } else {
          doc.text(currentLine, margin, yPosition);
          yPosition += lineHeight;
          currentLine = word;
        }
      }

      if (currentLine !== "") {
        doc.text(currentLine, margin, yPosition);
        yPosition += lineHeight;
      }
    });
  }
  doc.save("diety.pdf");
};

// Funkcja do obsługi przycisku pobierania diet w formacie PDF
const handleFoodInfoClick = async () => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Brak identyfikatora użytkownika.");
    return;
  }

  const info = await getInfoLinks(userId);
  const food = info.info_food;

  if (food.length === 0) {
    alert("Brak dostępnych diet.");
    return;
  }

  // Pobierz plik PDF z dietami
  downloadFoodPDF(food);
};

document.getElementById("infoButton").addEventListener("click", function () {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Brak identyfikatora użytkownika.");
    return;
  }
  updateInfoLinks(userId);
  document.getElementById("mainSection").style.display = "none";
  document.getElementById("infoSection").style.display = "flex";
});

document
  .getElementById("backToMainFromInfo")
  .addEventListener("click", function () {
    document.getElementById("infoSection").style.display = "none";
    document.getElementById("mainSection").style.display = "flex";
  });

document
  .getElementById("foodInfo")
  .addEventListener("click", handleFoodInfoClick);
