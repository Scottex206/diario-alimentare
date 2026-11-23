# Diario alimentare

Web app personale per segnare pasti, allenamenti, peso e composizione corporea.
Si installa sul telefono come un'app e funziona anche senza connessione.

Il codice non contiene dati personali: i dati restano solo sul telefono
(memoria del browser) e si caricano da **Impostazioni (ingranaggio) → Importa dati**
con un file di backup `.json`. Da lì si può anche esportare un backup.

- **Esporta PDF** (in fondo alla home): diario del periodo scelto da inviare alla nutrizionista.
- **Importa da Samsung Health**: allenamenti e pesate dallo ZIP di "Scarica dati personali" (ignora i dati precedenti alla data limite).
- **Leggi schermata Feelfit**: riconosce i valori della bilancia da uno screenshot (OCR nel browser, cartella `ocr`).

Librerie incluse (licenze libere): jsPDF 2.5.2 e jsPDF-AutoTable 3.8.4 (MIT), Anime.js 4.5.0 (MIT), fflate 0.8.3 (MIT),
Tesseract.js 6.0.1 (Apache 2.0) con tesseract.js-core 6.1.2 (Apache 2.0) e dati della lingua italiana (@tesseract.js-data/ita, MIT).
