# GBNGO InStore Portal

Interaktiv spelportal för kunder i den obemannade Grab'n GO-butiken. Kunder spelar minispel på en iPad/skärm i butiken med sin mobil som trådlös kontroller via WebSocket.

## Snabbstart

```bash
# Windows - starta båda server och klient
"START GBNGO InStore Portal.bat"

# Eller manuellt:
cd server && npm run dev    # Backend på port 5250
cd client && npm run dev    # Frontend på port 5251
```

## Åtkomst

| Vy | URL |
|---|---|
| Huvudapp (iPad/Skärm) | http://localhost:5251 |
| Mobil-kontroller | http://localhost:5251/controller |
| API Server | http://localhost:5250 |
| Admin Panel | http://localhost:5251/admin (kod: 5250) |

## Installation

### Förutsättningar
- Node.js 18+
- npm

### Setup

```bash
# Installera dependencies
cd server && npm install
cd ../client && npm install

# Initiera databasen (om ny installation)
cd server && npm run db:init
```

## Dokumentation

| Fil | Innehåll |
|-----|----------|
| [STRUCTURE-Architecture---gbngo-inStore.md](STRUCTURE-Architecture---gbngo-inStore.md) | Mappstruktur och filer |
| [CODE-Architecture---gbngo-inStore.md](CODE-Architecture---gbngo-inStore.md) | Komponenter, contexts, hooks |
| [DATABASE-Architecture---gbngo-inStore.md](DATABASE-Architecture---gbngo-inStore.md) | SQLite schema och tabeller |
| [API-Architecture---gbngo-inStore.md](API-Architecture---gbngo-inStore.md) | REST API och WebSocket |
| [TODO-Features---gbngo-inStore.md](TODO-Features---gbngo-inStore.md) | Framtida idéer |
| [CHANGELOG.md](CHANGELOG.md) | Versionshistorik |
| [CLAUDE.md](CLAUDE.md) | Claude Code-instruktioner |

## Teknisk Stack

- **Frontend:** React, Vite, CSS Modules, Framer Motion, Three.js, react-i18next
- **Backend:** Node.js, Express, SQLite (sql.js), Socket.io

## Funktioner

- 🎮 Minispel (Snake, Pong, Tic-Tac-Toe)
- 📱 Mobil som trådlös kontroller via WebSocket
- 🎫 Ticket-system (skanna kvitto → få tickets)
- 🏆 Highscore-listor
- 🎯 Turneringar (3-4 spelare)
- 🎨 6 teman (Standard, Vinter, Påsk, Western, Sommar, Retro GameBoy)
- 🌍 4 språk (Svenska, English, Dansk, Deutsch)

---

*GBNGO InStore Portal - Byggt för en roligare shoppingupplevelse!*
