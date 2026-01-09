# DEPRECATED - Do not use

Content extracted to: STRUCTURE/CODE/DATABASE/API-Architecture---gbngo-inStore.md
Date: 2026-01-09

---

# GBNGO InStore Portal - Arkitektur

## Projektöversikt

GBNGO InStore Portal är en interaktiv spelportal för den obemannade butiken Grab'n GO. Kunder använder en iPad/skärm i butiken för att spela minispel, med mobilen som trådlös kontroller via WebSocket.

**Status:** 209 av 209 features implementerade (100%)

---

## Projektstruktur

```
gbngo-gameMenu/
├── client/                  # React Frontend (Vite)
│   ├── src/
│   │   ├── components/      # Återanvändbara komponenter
│   │   │   ├── GameCube.jsx         # 3D-roterande spelkub (Three.js)
│   │   │   ├── IdleViews/           # Viloläges-vyer
│   │   │   └── ...
│   │   ├── contexts/        # React Context
│   │   │   ├── AuthContext.jsx      # Autentisering & sessions
│   │   │   └── ThemeContext.jsx     # Tema-hantering (6 teman)
│   │   ├── pages/           # Sidor/Routes
│   │   │   ├── admin/               # Admin-panelen
│   │   │   ├── IdlePage.jsx         # Attraktläge
│   │   │   ├── GamesPage.jsx        # Spelval
│   │   │   ├── ControllerPage.jsx   # Mobil-kontroller
│   │   │   └── ...
│   │   ├── i18n/            # Flerspråksstöd (sv, en, da, de)
│   │   └── App.jsx          # Routing & layout
│   └── package.json
│
├── server/                  # Node.js Backend (Express)
│   ├── src/
│   │   ├── database/
│   │   │   └── init.js      # SQLite setup & schema
│   │   ├── routes/          # REST API endpoints
│   │   │   ├── auth.js, users.js, tickets.js
│   │   │   ├── games.js, highscores.js
│   │   │   ├── tournaments.js
│   │   │   └── ...
│   │   ├── websocket/
│   │   │   └── controller.js  # Socket.io för mobil-kontroller
│   │   └── index.js         # Server entry point
│   ├── data/
│   │   └── gbngo.db         # SQLite databas (sparas här)
│   └── uploads/             # Uppladdade bilder
│
├── scripts/                 # Startscript för Windows Terminal
│   ├── start-server.cmd     # Backend med info-box
│   └── start-client.cmd     # Frontend med info-box
│
├── features.db              # AutoCoder feature-tracking
└── START GBNGO InStore Portal.bat  # Startar båda i Windows Terminal tabbar
```

---

## Databas

**Typ:** SQLite (via `sql.js` - körs i minnet, sparas till fil)

**Databasfil:** `server/data/gbngo.db`

**Auto-save:** Databasen sparas automatiskt var 5:e sekund om ändringar gjorts.

### Tabeller

| Tabell | Beskrivning |
|--------|-------------|
| `users` | Användare (initialer, PIN, QR-kod, tickets) |
| `games` | Spel (Future Snake, Tic-Tac-Toe, Pong) |
| `highscores` | Poängtavla per spel/användare |
| `game_sessions` | Spelhistorik |
| `tournaments` | Turneringar |
| `tournament_players` | Turneringsdeltagare |
| `tournament_matches` | Turneringsmatcher |
| `categories` | Produktkategorier |
| `products` | Butiksprodukter |
| `used_receipts` | Använda kvitton (förhindrar dubbletter) |
| `idea_responses` | Idélåda frågor/svar |
| `advertisements` | Reklam |
| `settings` | Systeminställningar (key-value) |

---

## Kommunikation

### REST API (Port 5250)

Alla routes under `/api/`:
- `auth` - Gäst/user/admin login, QR-login, session
- `users`, `tickets`, `games`, `highscores`
- `products`, `categories` - Butiksproduktkatalog
- `idea-responses`, `advertisements` - Kundengagemang
- `admin`, `settings`, `tournaments`

### WebSocket (Socket.io, Port 5250)

| Namespace | Användning |
|-----------|------------|
| `/controller` | Mobiltelefonen ansluter här |
| `/game` | Spelskärmen (iPad) ansluter här |

**Stöd för:** D-pad, knappar (A, B, Start, Select)

**Reconnect:** 30 sekunders grace period vid tappad anslutning

---

## Spelflöde

1. **Viloläge** (IdlePage) → Roterar mellan kub, demos, idélåda, reklam
2. **Kvittoskanning** → Ger tickets baserat på köpbelopp
3. **Autentisering** → Gäst (5 initialer) eller konto (initialer + PIN)
4. **Spelval** → Välj spel, läge (solo/multiplayer/turnering)
5. **QR-kod** → Genereras för att ansluta mobil som kontroller
6. **Spela** → Mobilen styr via WebSocket
7. **Highscore** → Sparas i databasen

---

## Teman

6 teman implementerade i `ThemeContext.jsx`:

| Tema | Beskrivning |
|------|-------------|
| `default` | Grab'n GO röd/vit |
| `winter` | Blåa is-toner |
| `easter` | Pastell/påsk |
| `western` | Bruna öken-toner |
| `summer` | Ljusa sol-färger |
| `retro` | GameBoy grönt |

---

## Språkstöd

4 språk via `react-i18next`:
- Svenska (sv) - default
- English (en)
- Dansk (da)
- Deutsch (de)

Översättningar i `client/src/i18n/`

---

## Portar

| Tjänst | Port |
|--------|------|
| Backend (Express + Socket.io) | 5250 |
| Frontend (Vite) | 5251 |

**OBS:** 5250 är även admin-koden för att komma åt admin-panelen.

---

## Framtida planer

Möjliga integrationer:
- B2B-food
- Hybridbutik
- Kampanjer/rabatter baserat på highscores
- Extern KundPortal (web-version)
