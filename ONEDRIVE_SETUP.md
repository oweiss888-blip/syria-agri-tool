# OneDrive Datenbank einrichten

## Idee
Die Datenbank (datenbank.json) liegt in einem geteilten OneDrive-Ordner.
Du und dein Freund haben beide Zugriff auf denselben Ordner.
OneDrive synchronisiert die Daten automatisch.

## Schritt 1 – OneDrive-Ordner erstellen
1. Öffne deinen OneDrive-Ordner (z.B. C:\Users\weiss\OneDrive\)
2. Erstelle einen neuen Ordner: **Syria-Agri**

## Schritt 2 – .env Datei einrichten
Öffne die Datei `.env` und trage ein:
```
ANTHROPIC_API_KEY=sk-ant-DEIN-KEY
DB_PATH=C:\Users\weiss\OneDrive\Syria-Agri\datenbank.json
```
(Pfad anpassen – ersetze "weiss" mit deinem Windows-Benutzernamen)

## Schritt 3 – Ordner mit Freund teilen
1. Rechtsklick auf den Ordner **Syria-Agri** in OneDrive
2. "Teilen" → E-Mail deines Freundes eingeben
3. Berechtigung: **Bearbeiten** (nicht nur Anzeigen!)
4. Freund erhält eine E-Mail mit dem geteilten Ordner

## Schritt 4 – Freund einrichten
Dein Freund:
1. Nimmt die OneDrive-Einladung an
2. Der Ordner **Syria-Agri** erscheint in seinem OneDrive
3. Er installiert das Tool (npm install)
4. Er trägt in seine .env ein:
   ```
   DB_PATH=C:\Users\SEIN_NAME\OneDrive\Syria-Agri\datenbank.json
   ```
5. START.bat doppelklicken

## Fertig!
Ab jetzt: Wenn du eine Idee speicherst, wird sie in OneDrive gesichert.
Wenn dein Freund START.bat öffnet (nach OneDrive-Sync), sieht er deine Idee.

## Wichtig
- Nicht gleichzeitig nutzen und speichern (OneDrive-Sync dauert 1-2 Sekunden)
- Die Datenbank ist eine normale JSON-Datei – du kannst sie in OneDrive öffnen und lesen
- Backup: OneDrive behält automatisch Versionen (Versionsverlauf)
