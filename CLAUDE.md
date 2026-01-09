# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GBNGO KundPortal is an interactive game portal for the unmanned Grab'n GO store. Customers use an iPad/screen in the store to play minigames, with their mobile phone as a wireless controller via WebSocket.

## Quick Start

```bash
# Start both server and client (Windows)
"START gbngo KundPortal.bat"

# Or manually:
cd server && npm run dev    # Backend on port 5250
cd client && npm run dev    # Frontend on port 5251
```

## Common Commands

### Client (React/Vite)
```bash
cd client
npm run dev      # Development server with HMR
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

### Server (Node.js/Express)
```bash
cd server
npm run dev      # Development with --watch
npm start        # Production mode
npm run db:init  # Initialize/reset SQLite database
```

## Architecture

### Two-Device System
- **Game Screen** (iPad/store display): Shows games, connects via WebSocket namespace `/game`
- **Mobile Controller** (customer's phone): D-pad/buttons, connects via WebSocket namespace `/controller`

### WebSocket Flow
1. Game screen creates session via `create-session` event
2. Mobile scans QR code with session ID, joins via `join-session`
3. Controller sends `dpad`/`button` events → forwarded to game screen as `controller-dpad`/`controller-button`
4. Supports reconnection with tokens (30s grace period)

### Authentication Types
- **Guest**: 5 initials only, session-based tickets
- **Registered User**: 5 initials + 4-digit PIN, persistent tickets, QR login
- **Admin**: Code 5250, access via `/admin`

### API Structure
All routes under `/api/`:
- `auth` - Guest/user/admin login, QR login, session
- `users`, `tickets`, `games`, `highscores`
- `products`, `categories` - Store product catalog
- `idea-responses`, `advertisements` - Customer engagement
- `admin`, `settings`, `tournaments`

### Frontend Patterns
- **AuthContext**: Wraps app, provides `useAuth()` hook with login methods
- **ThemeContext**: 6 themes (standard, winter, easter, western, summer, retro-gameboy)
- **CSS Modules**: Component-scoped styles with CSS variables for theming
- **Protected Routes**: `ProtectedRoute` (user) and `AdminRoute` (admin) wrappers

### Key URLs
| Route | Purpose |
|-------|---------|
| `/` | Idle screen with rotating ads |
| `/start` | Entry point for customers |
| `/controller` | Mobile controller interface |
| `/games/:slug/play` | Game play with mode selection |
| `/admin` | Admin panel (requires code) |

## Database

SQLite via sql.js (in-memory with file persistence). Schema initialized in `server/src/database/init.js`.

## Internationalization

4 languages via react-i18next: Swedish (default), English, Danish, German. Translations in `client/src/i18n/`.
