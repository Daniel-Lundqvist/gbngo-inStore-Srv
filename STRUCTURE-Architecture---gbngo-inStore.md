# Project Structure - gbngo-inStore

GBNGO InStore Portal - Interaktiv spelportal for Grab'n GO butiken.

## Folder Overview

```
gbngo-inStore-Srv/
├── client/                  # React Frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── GameCube.jsx         # 3D rotating game cube (Three.js)
│   │   │   ├── IdleViews/           # Idle mode views
│   │   │   └── FileUpload.jsx       # Image upload component
│   │   ├── contexts/        # React Context
│   │   │   ├── AuthContext.jsx      # Authentication & sessions
│   │   │   └── ThemeContext.jsx     # Theme management (6 themes)
│   │   ├── pages/           # Pages/Routes
│   │   │   ├── admin/               # Admin panel
│   │   │   ├── IdlePage.jsx         # Attract mode
│   │   │   ├── GamesPage.jsx        # Game selection
│   │   │   ├── ControllerPage.jsx   # Mobile controller
│   │   │   └── ...
│   │   ├── i18n/            # Internationalization (sv, en, da, de)
│   │   ├── styles/          # CSS files
│   │   │   ├── global.css           # Global styles + CSS variables
│   │   │   └── themes.css           # Theme-specific CSS
│   │   └── App.jsx          # Routing & layout
│   ├── vite.config.js       # Vite configuration
│   └── package.json
│
├── server/                  # Node.js Backend (Express)
│   ├── src/
│   │   ├── database/
│   │   │   └── init.js      # SQLite setup & schema
│   │   ├── routes/          # REST API endpoints
│   │   │   ├── auth.js, users.js, tickets.js
│   │   │   ├── games.js, highscores.js
│   │   │   ├── settings.js, tournaments.js
│   │   │   └── ...
│   │   ├── websocket/
│   │   │   └── controller.js  # Socket.io for mobile controller
│   │   └── index.js         # Server entry point
│   ├── data/
│   │   └── gbngo.db         # SQLite database
│   └── uploads/             # Uploaded images
│
├── scripts/                 # Startup scripts for Windows Terminal
│   ├── start-server.cmd     # Backend with info box
│   └── start-client.cmd     # Frontend with info box
│
├── docs/                    # Documentation archive
│   └── old/                 # Deprecated docs
│
└── START GBNGO InStore Portal.bat  # Starts both in Windows Terminal tabs
```

## Key Directories

| Directory | Purpose |
|-----------|---------|
| client/src/components | Reusable UI components |
| client/src/pages | Route pages |
| client/src/pages/admin | Admin panel pages |
| client/src/contexts | React Context providers |
| client/src/i18n | Translation files |
| server/src/routes | API endpoint handlers |
| server/src/database | SQLite initialization |
| server/data | Database file storage |
| server/uploads | User-uploaded images |

## Configuration Files

| File | Purpose |
|------|---------|
| client/vite.config.js | Vite build configuration |
| client/src/main.jsx | Client entry point |
| server/src/index.js | Server entry point |
| server/src/database/init.js | Database initialization |
| .mcp.json | Playwright MCP config |

## Ports

| Service | Port |
|---------|------|
| Backend (Express + Socket.io) | 5250 |
| Frontend (Vite) | 5251 |

**Note:** 5250 is also the admin access code.

---

*Auto-maintained by architecture-mapper skill*
