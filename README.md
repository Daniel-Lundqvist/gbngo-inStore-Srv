# Grab'n GO QuickGames

En interaktiv spelportal for kunder i den obemannade butiken Grab'n GO. Kunder skannar sitt kvitto efter kop for att fa "tickets" som ger tillgang till minispel.

## Oversikt

- **Malgrupp**: Kunder i Grab'n GO-butiken
- **Plattform**: iPad/skarm i butiken + kundens mobil som kontroller
- **Syfte**: Ge kunderna en rolig upplevelse och oka engagemanget

## Funktioner

### For Kunder
- Skanna kvitto for att fa tickets
- Spela minispel (Future Snake, Tic-Tac-Toe, Pong)
- Tavla pa highscore-listor
- Delta i turneringar (3-4 spelare)
- Anvand mobilen som spelkontroller via WebSocket

### Spellagen
- **Single Player**: Spela ensam, jaga highscore
- **Together**: Tva spelare mot varandra
- **Take Turns**: Turas om att spela
- **Tournament**: 3-4 spelare i bracket-format

### For Administratorer
- Konfigurera ticket-priser och giltighetstider
- Hantera produktkatalog med kategorier och taggar
- Skapa idelada-svar (fraga/svar till kunder)
- Hantera reklamannonser
- Se statistik och rensa highscores

## Teknisk Stack

### Frontend
- **React** med Vite
- **CSS Modules** + CSS Variables (tema-system)
- **React Context** for state management
- **Framer Motion** for animationer
- **Three.js** for 3D-roterande spelkub
- **react-i18next** for flerspraksstod (sv, en, da, de)

### Backend
- **Node.js** med Express
- **SQLite** databas
- **Socket.io** for WebSocket (mobil-kontroller)

## Installation

### Forutsattningar
- Node.js 18+
- npm
- Modern webblasare med kamerastod

### Setup

```bash
# Klona projektet och navigera till mappen
cd gbngo-gameMenu

# Kor setup-skriptet
./init.sh

# Eller installera manuellt:
cd server && npm install
cd ../client && npm install
```

## Starta Utvecklingsmiljo

```bash
# Backend (port 3001)
cd server && npm run dev

# Frontend (port 5173)
cd client && npm run dev

# Eller kör båda samtidigt från rotmappen:
npm run dev
```

## Atkomst

| Vy | URL |
|---|---|
| Huvudapp (iPad/Skarm) | http://localhost:5173 |
| Mobil-kontroller | http://localhost:5173/controller |
| API Server | http://localhost:3001 |
| Admin Panel | http://localhost:5173/admin (kod: 5250) |

## Projektstruktur

```
gbngo-gameMenu/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React-komponenter
│   │   ├── pages/          # Sidkomponenter
│   │   ├── contexts/       # React Context
│   │   ├── hooks/          # Custom hooks
│   │   ├── styles/         # CSS Modules
│   │   ├── themes/         # Tema-definitioner
│   │   ├── i18n/           # Oversattningar
│   │   └── utils/          # Hjalputiliteter
│   └── public/
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API-endpoints
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Express middleware
│   │   ├── websocket/      # Socket.io handlers
│   │   └── database/       # SQLite setup
│   └── uploads/            # Uppladdade filer
├── features.db             # Feature tracking database
├── app_spec.txt            # Projektspecifikation
├── init.sh                 # Setup-skript
└── README.md
```

## Teman

Appen stodjer 6 teman:
1. **Standard** - Grab'n GO rod/vit
2. **Vinter** - Sno, is, bla toner
3. **Pask** - Pasteller, varfarger
4. **Western** - Oken, brunt, country-stil
5. **Sommar** - Sol, strand, ljusa farger
6. **Retro GameBoy** - Gront LCD, pixelkansla

## Sprak

- Svenska (sv) - default
- English (en)
- Dansk (da)
- Deutsch (de)

## Anvandarsystem

### Gastanvandare
- Ange 5 initialer (filtreras for olamplga ord)
- Tickets galler inom sessionen
- Kan satta highscore med initialer

### Aterkommande Gaster
- 5 initialer + 4-siffrig PIN
- Tickets sparas mellan besok
- Personlig QR-kod for snabb inloggning
- Personlig mini-dashboard

### Administratorer
- Atkomst via kod 5250
- Full konfiguration av alla installningar

## API-dokumentation

Se `app_spec.txt` for fullstandig API-specifikation.

## Utvecklingsstatus

Se features.db for aktuell status pa alla funktioner.
- Totalt: 209 features att implementera
- Kategorier: Security, Navigation, Data, Workflow, Error Handling, etc.

---

Grab'n GO QuickGames - Byggt for en roligare shoppingupplevelse!
