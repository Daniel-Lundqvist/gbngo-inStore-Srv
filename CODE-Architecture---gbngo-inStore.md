# Code Architecture - gbngo-inStore

Components, pages, contexts and key functions in the GBNGO InStore Portal.

## Admin Pages

| Page | File | Description |
|------|------|-------------|
| AdminDashboard | client/src/pages/admin/AdminDashboard.jsx | Start view with section cards |
| AdminSettings | client/src/pages/admin/AdminSettings.jsx | Ticket, session, idle-mode, theme |
| AdminProducts | client/src/pages/admin/AdminProducts.jsx | Product management with pagination |
| AdminCategories | client/src/pages/admin/AdminCategories.jsx | Categories with sort order |
| AdminIdeaResponses | client/src/pages/admin/AdminIdeaResponses.jsx | Idea box Q&A management |
| AdminAdvertisements | client/src/pages/admin/AdminAdvertisements.jsx | Ad management with image upload |
| AdminStatistics | client/src/pages/admin/AdminStatistics.jsx | Statistics and export |
| AdminMaintenance | client/src/pages/admin/AdminMaintenance.jsx | Data cleanup and danger zone |
| AdminGames | client/src/pages/admin/AdminGames.jsx | Game management |
| AdminLayout | client/src/pages/admin/AdminLayout.jsx | Layout wrapper for admin |

## User-Facing Pages

| Page | File | Description |
|------|------|-------------|
| IdlePage | client/src/pages/IdlePage.jsx | Idle mode with rotating views |
| StartPage | client/src/pages/StartPage.jsx | Choice: guest/login/register |
| GuestPage | client/src/pages/GuestPage.jsx | Guest registration (5 initials) |
| LoginPage | client/src/pages/LoginPage.jsx | Login with initials + PIN |
| RegisterPage | client/src/pages/RegisterPage.jsx | Account registration |
| ControllerPage | client/src/pages/ControllerPage.jsx | Mobile controller interface |
| GamesPage | client/src/pages/GamesPage.jsx | Game selection |

## Contexts

| Context | File | Provides |
|---------|------|----------|
| ThemeContext | client/src/contexts/ThemeContext.jsx | theme, changeTheme() - 6 themes |
| AuthContext | client/src/contexts/AuthContext.jsx | user, login(), logout(), isAdmin |

## Components

| Component | File | Description |
|-----------|------|-------------|
| GameCube | client/src/components/GameCube.jsx | 3D rotating game cube (Three.js) |
| FileUpload | client/src/components/FileUpload.jsx | Image upload (used by AdminAdvertisements) |
| IdleViews/* | client/src/components/IdleViews/ | Idle mode view components |

## Styles

| File | Description |
|------|-------------|
| client/src/styles/global.css | Global styles + CSS variables for all themes |
| client/src/styles/themes.css | Theme-specific CSS (imported by global) |
| client/src/pages/admin/AdminSection.module.css | CSS Module for admin pages |
| client/src/pages/admin/AdminDashboard.module.css | CSS Module for admin dashboard |

## i18n (Internationalization)

| Language | File |
|----------|------|
| Svenska (default) | client/src/i18n/locales/sv.json |
| English | client/src/i18n/locales/en.json |
| Dansk | client/src/i18n/locales/da.json |
| Deutsch | client/src/i18n/locales/de.json |

## Themes

6 themes implemented in ThemeContext.jsx:

| Theme | Description |
|-------|-------------|
| default | Grab'n GO red/white |
| winter | Blue ice tones |
| easter | Pastel colors |
| western | Brown desert tones |
| summer | Bright sun colors |
| retro | GameBoy green |

---

*Auto-maintained by architecture-mapper skill*
