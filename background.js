console.log("init yes");
chrome.commands.onCommand.addListener((command) => {
  console.log("event " + command);
  if (command === "copy-html") {
    console.log("on copy");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: copySiteHTML,
      });
    });
  }
});

function copySiteHTML() {
  // Selektiere das div-Element mit der ID 'lln-subs'
  const container = document.getElementById("lln-subs");

  if (!container) {
    console.log('No div with the ID "lln-subs" found.');
    return;
  }
  // Selektiere alle span-Elemente mit dem Attribut 'data-token-index' innerhalb des Containers
  const tokenSpans = container.querySelectorAll(
    "span[data-token-index], span.lln-white-punct"
  );

  // Initialisiere einen leeren String, um den Text der spans zu sammeln
  let textContent = "";

  // Durchlaufe jedes gefundene span-Element
  tokenSpans.forEach((span) => {
    const translitSpan = span.querySelector(".translit");
    if (translitSpan) {
      // Wenn ein 'translit'-Span vorhanden ist, füge den Inhalt speziell formatiert hinzu
      textContent +=
        " " +
        getMainTextFromSpan(span) +
        "[" +
        translitSpan.textContent.trim() +
        "]";
    } else {
      // Füge den normalen Textinhalt des span-Elements hinzu
      textContent += getMainTextFromSpan(span);
    }
  });

  function getMainTextFromSpan(spanElement) {
    // Durchlaufe alle Kindknoten des Span-Elements
    for (const node of spanElement.childNodes) {
      // Prüfe, ob der Knoten ein Textknoten ist
      if (node.nodeType === Node.TEXT_NODE) {
        // Entferne Leerzeichen am Anfang und Ende des Textes
        const trimmedText = node.textContent.trim();
        // Gebe den bereinigten Text zurück, wenn er nicht leer ist
        if (trimmedText) {
          return trimmedText;
        }
      }
    }
    // Gebe einen leeren String zurück, falls kein Text gefunden wurde
    return "";
  }

  // Prüfe, ob Text gefunden wurde und kopiere diesen in die Zwischenablage
  if (textContent) {
    navigator.clipboard
      .writeText(textContent)
      .then(() => {
        console.log(
          'Text content of spans with "data-token-index" has been copied to the clipboard'
        );
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  } else {
    console.log('No spans with "data-token-index" found within the div.');
  }
}
