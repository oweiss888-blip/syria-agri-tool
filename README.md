# 🌾 Syria Agri Export Tool · Beta v0.1

Lokales Analyse-Tool für Agrar-Export Deutschland → Syrien.

---

## ⚡ Schnellstart (3 Schritte)

### 1. Node.js installieren (falls noch nicht vorhanden)
👉 https://nodejs.org → "LTS" Version herunterladen und installieren

### 2. Abhängigkeiten installieren
Öffne ein Terminal / die Eingabeaufforderung in diesem Ordner und tippe:
```
npm install
```

### 3. API Key einrichten
- Kopiere `.env.example` → benenne sie um in `.env`
- Öffne `.env` mit Editor und trage deinen Anthropic API Key ein:
  ```
  ANTHROPIC_API_KEY=sk-ant-DEIN-KEY-HIER
  ```
- API Key erhältst du unter: https://console.anthropic.com

### 4. Server starten
```
npm start
```

### 5. Browser öffnen
👉 http://localhost:3000

---

## 📁 Dateistruktur

```
syria-agri-tool/
├── server.js          → Lokaler Server (API-Proxy)
├── package.json       → Abhängigkeiten
├── .env               → API Key (NICHT teilen!)
├── .env.example       → Vorlage für .env
├── data.json          → Gespeicherte Daten (Ideen, Kontakte)
└── public/
    └── index.html     → Das Tool (Frontend)
```

---

## 🔧 Module

| Modul | Funktion |
|-------|----------|
| 💡 Ideen | Projektideen erfassen & priorisieren |
| 🔍 Marktrecherche | KI scannt syrischen Agrarmarkt live |
| 🛡️ Compliance | EU-Embargo & BAFA-Check pro Produkt |
| 💰 Finanzierung | KfW, FAO, IsDB Förderprogramme suchen |
| 👥 Kontakte | CRM für alle Geschäftskontakte |

---

## ⚠️ Wichtiger Hinweis

EU-Sanktionen (VO 36/2012) gegen Syrien sind aktiv.
Agrarprodukte sind grundsätzlich ausgenommen.
Vor jedem Export: Rechtsanwalt + BAFA (www.bafa.de) konsultieren.

---

## 🚀 Nächste Version (geplant)

- [ ] Zolldokumenten-Checkliste
- [ ] PDF-Export für Reports
- [ ] VPS-Deployment
- [ ] Mehrsprachigkeit (Arabisch)
