# Database Architecture - gbngo-inStore

SQLite database schema for the GBNGO InStore Portal.

## Overview

- **Type:** SQLite (via sql.js - runs in memory, persists to file)
- **Location:** server/data/gbngo.db
- **Init script:** server/src/database/init.js
- **Auto-save:** Database saves automatically every 5 seconds if changes detected

## Tables

| Table | Description |
|-------|-------------|
| users | User accounts (initials, PIN, QR code, tickets) |
| games | Games (Future Snake, Tic-Tac-Toe, Pong) |
| highscores | Highscore table per game/user |
| game_sessions | Game history |
| tournaments | Tournaments |
| tournament_players | Tournament participants |
| tournament_matches | Tournament matches |
| categories | Product categories |
| products | Store products |
| used_receipts | Used receipts (prevents duplicates) |
| idea_responses | Idea box questions/answers |
| advertisements | Ads |
| settings | System settings (key-value) |

## Schema Details

### users
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| initials | TEXT | 5-letter initials |
| pin | TEXT | 4-digit PIN (hashed) |
| qr_code | TEXT | Personal QR code |
| tickets | INTEGER | Current ticket balance |
| created_at | DATETIME | Registration timestamp |

### games
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| slug | TEXT | URL-friendly name |
| name | TEXT | Display name |
| description | TEXT | Game description |
| active | BOOLEAN | Is game available |

### highscores
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | FK to users |
| game_id | INTEGER | FK to games |
| score | INTEGER | Score achieved |
| created_at | DATETIME | When score was set |

### settings
| Column | Type | Description |
|--------|------|-------------|
| key | TEXT | Setting name (primary key) |
| value | TEXT | Setting value (JSON) |

Key settings:
- `ticketBaseValue` - Base tickets per purchase
- `sessionTimeout` - Session timeout in minutes
- `idleTimeout` - Idle mode timeout
- `currentTheme` - Active theme

## Relationships

```
users.id → highscores.user_id
games.id → highscores.game_id
users.id → game_sessions.user_id
games.id → game_sessions.game_id
tournaments.id → tournament_players.tournament_id
users.id → tournament_players.user_id
tournaments.id → tournament_matches.tournament_id
categories.id → products.category_id
```

---

*Auto-maintained by architecture-mapper skill*
