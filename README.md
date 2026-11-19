# Diario alimentare

Web app personale per segnare pasti, allenamenti, peso e composizione corporea.
Si installa sul telefono come un'app e funziona anche senza connessione.

Il codice non contiene dati personali: i dati restano solo sul telefono
(memoria del browser) e si caricano da **Impostazioni (ingranaggio) → Importa dati**
con un file di backup `.json`. Da lì si può anche esportare un backup.

Dalla home, **Esporta PDF** crea il diario del periodo scelto (tabella, giorno per giorno o riepilogo con grafici) da inviare alla nutrizionista.

Librerie incluse: jsPDF 2.5.2 e jsPDF-AutoTable 3.8.4 (licenza MIT).
