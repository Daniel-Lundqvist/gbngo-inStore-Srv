# CHANGELOG - GBNGO InStore Portal

Logg över ändringar och utveckling av projektet.

---

## [Unreleased]

### Planerat
- Se `claude-todo-features.md` för framtida idéer

---

## [v26.2.5] - 2026-01-09

### Fixat
- **ÅÄÖ-stöd** - Svenska tecken fungerar nu i initialer-input (Guest, Login, Register)
- **Tillbaka-knapp kontrast** - Sekundärknappar (`a.btn-secondary`) syns nu tydligt i alla teman
- **Input-fält kontrast** - Ny `--color-border` CSS-variabel i alla 6 teman löser "vit på vit"-problemet
- **Idle Mode-inställningar** - Admin-inställningar för viloläge respekteras nu korrekt
- **sv.json encoding** - Alla svenska tecken (å, ä, ö) återställda i översättningsfilen
- **AdminSettings i18n** - All hårdkodad svensk text ersatt med översättningsnycklar

### Ändrat
- Konsekvent stränghantering för boolean-inställningar i IdlePage
- Temaspecifika border-färger för bättre synlighet
- AdminSettings.jsx använder nu fullt i18n-stöd
- Alla 4 språkfiler (sv, en, da, de) uppdaterade med nya admin-nycklar

---

## [1.0.0] - 2025-01-09

### Projektets ursprung
Projektet byggdes av **AutoCoder** - ett autonomt AI-utvecklingsstudio.
- 209 features specificerades i `features/original-spec.txt`
- Alla 209 features implementerades och verifierades (100%)

### Vad projektet är
En interaktiv spelportal för Grab'n GO's obemannade butiker:
- **Game Screen** (iPad/butiksskärm) - visar spel
- **Mobile Controller** (kundens mobil) - trådlös kontroller via WebSocket
- **Ticket-system** - kunder skannar kvitto för att få tickets
- **Highscores & Turneringar** - tävla mot andra kunder

### Teknisk stack
- Frontend: React + Vite (port 5251)
- Backend: Express + Socket.io (port 5250)
- Databas: SQLite (sql.js, in-memory med fil-persistens)
- 4 språk: Svenska, English, Dansk, Deutsch
- 6 teman: Standard, Vinter, Påsk, Western, Sommar, Retro GameBoy

---

## [1.0.1] - 2025-01-09

### Ändrat
- Bytt namn från "KundPortal" till "InStore Portal"
- Ändrat portar från 3001/5173 till 5250/5251 (5250 = admin-kod)
- Ny bat-fil: `START GBNGO InStore Portal.bat` med Windows Terminal tabbar
- Startscripts med info-boxar i `scripts/`

### Tillagt
- `CLAUDE.md` - Dokumentation för Claude Code
- `gbngo-inStore-Architecture.md` - Full arkitekturdokumentation
- `claude-todo-features.md` - Framtida feature-idéer
- `features/original-spec.txt` - Ursprunglig AutoCoder-spec

### Borttaget
- AutoCoder-filer (prompts/, features.db, init.sh, etc.)
- Temporära testfiler (cookies, update-scripts)
- Onödiga root-filer (package.json i rot)

### Dokumentation
- GitHub repo: https://github.com/Daniel-Lundqvist/gbngo-inStore-Srv

---

*Uppdateras automatiskt av Claude Code via changelog-updater skill*
