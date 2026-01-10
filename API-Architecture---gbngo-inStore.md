# API Architecture - gbngo-inStore

REST API and WebSocket endpoints for the GBNGO InStore Portal.

## Base URL

```
http://localhost:5250/api
```

## Route Files

| Route Group | File | Description |
|-------------|------|-------------|
| Auth | server/src/routes/auth.js | Authentication endpoints |
| Admin | server/src/routes/admin.js | Admin operations |
| Users | server/src/routes/users.js | User management |
| Games | server/src/routes/games.js | Game data |
| Highscores | server/src/routes/highscores.js | Score management |
| Products | server/src/routes/products.js | Product catalog |
| Categories | server/src/routes/categories.js | Product categories |
| Settings | server/src/routes/settings.js | System settings |
| Tickets | server/src/routes/tickets.js | Ticket operations |
| Tournaments | server/src/routes/tournaments.js | Tournament management |
| Advertisements | server/src/routes/advertisements.js | Ad management |
| Idea Responses | server/src/routes/idea-responses.js | Idea box Q&A |
| Upload | server/src/routes/upload.js | File uploads (ads, logo) |

## Authentication Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/guest | Create guest session |
| POST | /auth/login | Login with initials + PIN |
| POST | /auth/register | Register new user |
| POST | /auth/admin | Admin login (code: 5250) |
| GET | /auth/session | Get current session |
| POST | /auth/qr-login | Login via QR code |

## Game Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /games | List all games |
| GET | /games/:slug | Get game by slug |
| POST | /games | Create game (admin) |
| PUT | /games/:id | Update game (admin) |
| DELETE | /games/:id | Delete game (admin) |

## Highscore Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /highscores/:gameId | Get game highscores |
| POST | /highscores | Submit new score |
| DELETE | /highscores/:gameId | Clear game scores (admin) |

## Settings Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /settings | Get all settings |
| GET | /settings/:key | Get specific setting |
| GET | /settings/idle | Get idle mode settings (cube/ideas/ads/logo enabled + percent) |
| PUT | /settings/:key | Update setting (admin) |

## Upload Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /upload/advertisement | Upload advertisement image (admin) |
| POST | /upload/logo | Upload store logo (admin) |

## WebSocket (Socket.io)

**Port:** 5250 (same as REST API)

### Namespaces

| Namespace | Purpose |
|-----------|---------|
| /controller | Mobile phone connects here |
| /game | Game screen (iPad) connects here |

### Events

**Controller → Server:**
| Event | Payload | Description |
|-------|---------|-------------|
| join-session | { sessionId, token? } | Join game session |
| dpad | { direction } | D-pad input (up/down/left/right) |
| button | { button } | Button press (A/B/Start/Select) |

**Server → Game:**
| Event | Payload | Description |
|-------|---------|-------------|
| controller-joined | { controllerId } | Controller connected |
| controller-dpad | { direction } | D-pad forwarded |
| controller-button | { button } | Button forwarded |
| controller-disconnected | { controllerId } | Controller left |

**Game → Server:**
| Event | Payload | Description |
|-------|---------|-------------|
| create-session | { gameSlug } | Create new session |
| session-created | { sessionId, qrCode } | Session ready |

### Reconnection

- 30 second grace period for dropped connections
- Token-based reconnection support
- Controller can rejoin with same token

---

*Auto-maintained by architecture-mapper skill*
