# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GBNGO InStore Portal is an interactive game portal for the unmanned Grab'n GO store. Customers use an iPad/screen in the store to play minigames, with their mobile phone as a wireless controller via WebSocket.

## Quick Start

**Fastest:** Double-click `START GBNGO InStore Portal.bat` → starts both servers on ports 5250/5251.

Or manually:
```bash
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
All routes under `/api/`. See `API-Architecture---gbngo-inStore.md` for full details.
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

## Architecture Documentation

| File | Contents |
|------|----------|
| `STRUCTURE-Architecture---gbngo-inStore.md` | Folder structure and files |
| `CODE-Architecture---gbngo-inStore.md` | Components, contexts, hooks |
| `DATABASE-Architecture---gbngo-inStore.md` | SQLite schema and tables |
| `API-Architecture---gbngo-inStore.md` | REST API and WebSocket endpoints |

## Visual Testing with Playwright MCP

This project uses Playwright MCP for visual verification during development. Config: `.mcp.json`

### Testing Workflow
When implementing features, ALWAYS verify with Playwright:
1. **Navigate** to the relevant page (`mcp__playwright__browser_navigate`)
2. **Take screenshot** for visual verification (`mcp__playwright__browser_take_screenshot`)
3. **Interact** if needed (click, type, etc.)
4. **Verify** the result matches expectations

### Screenshot Organization
All test screenshots go in `.tests/screenshots/<feature-or-task>/`:
```
.tests/
  screenshots/
    admin-theme-check/
      01-admin-page.png
      02-theme-dropdown.png
    user-login/
      01-login-form.png
      02-success-state.png
```

### Cleanup Rules
- Delete screenshots after feature is verified and committed
- Keep only screenshots needed for bug reports or documentation
- Run cleanup at end of each session: `rm -rf .tests/screenshots/*`

### Available Playwright Tools
| Tool | Purpose |
|------|---------|
| `browser_navigate` | Go to URL |
| `browser_take_screenshot` | Capture current page |
| `browser_snapshot` | Get accessibility tree (lightweight) |
| `browser_click` | Click element |
| `browser_type` | Type text |
| `browser_fill_form` | Fill form fields |
| `browser_evaluate` | Run JS in browser |

### When to Verify
- After any UI change
- After styling/theme changes
- After adding new pages/routes
- When fixing visual bugs

### Timing & Live Pages Warning
**This project has games with timers!** Be careful when verifying:
- Snake, Pong etc. start immediately and can cause game over before screenshot
- Use `browser_wait_for` to wait for specific elements
- Ask user to pause/confirm before taking screenshots of active games
- Prefer verifying static pages (admin, settings) over live gameplay

### Bug Hunting Checklist
When verifying, actively look for:
- **Spacing:** Text too close to checkboxes, buttons, inputs
- **ÅÄÖ encoding:** Swedish characters showing as ? or mojibake
- **Contrast:** Text hard to read against background
- **Overflow:** Text clipping or unwanted scrollbars

## Reference Documentation

- **`features/original-spec.txt`** - Original AutoCoder spec with all 205+ features
- **`TODO-Features---gbngo-inStore.md`** - Future feature ideas (auto-updated by idea-catcher skill)
- **`CHANGELOG.md`** - Version history (auto-updated by changelog-updater skill)

### Database Migration (Optional)
If cloud sync between stores is needed later, see Convex documentation:
`C:/AI-Projekt/Daniels-Egna-AI-Toolbox/convex-claude-info.md`

## Known Issues (Kanda problem)

### Edit tool + ~/.claude/CLAUDE.md

Edit tool often gives "File has been unexpectedly modified" when editing global CLAUDE.md.

**Cause:** Claude Code reads the file continuously, creating conflicts.

**Solution:** Use Bash instead of Edit:
- Backup: cp fil fil.backup
- Extract clean lines: head -N fil > fil.clean  
- Append new content to .clean
- Replace original: mv fil.clean fil

**Do NOT** retry Edit multiple times - go directly to Bash workaround.
