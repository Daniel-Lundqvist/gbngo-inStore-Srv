# DEPRECATED - Do not use

Content extracted to: CODE-Architecture---gbngo-inStore.md
Date: 2026-01-09

---

# Project Architecture Map

Auto-genererad av Claude för snabbare navigering i GBNGO InStore Portal.

## Admin Pages

| Sida | Fil | Beskrivning |
|------|-----|-------------|
| AdminDashboard | `client/src/pages/admin/AdminDashboard.jsx` | Startvy med sektionskort |
| AdminSettings | `client/src/pages/admin/AdminSettings.jsx` | Ticket, session, idle-mode, tema |
| AdminProducts | `client/src/pages/admin/AdminProducts.jsx` | Produkthantering med pagination |
| AdminCategories | `client/src/pages/admin/AdminCategories.jsx` | Kategorier med sorteringsordning |
| AdminIdeaResponses | `client/src/pages/admin/AdminIdeaResponses.jsx` | Idélåda Q&A hantering |
| AdminAdvertisements | `client/src/pages/admin/AdminAdvertisements.jsx` | Annonshantering med bilduppladdning |
| AdminStatistics | `client/src/pages/admin/AdminStatistics.jsx` | Statistik och export |
| AdminMaintenance | `client/src/pages/admin/AdminMaintenance.jsx` | Datarensning och farozon |
| AdminLayout | `client/src/pages/admin/AdminLayout.jsx` | Layout-wrapper för admin |

## User-Facing Pages

| Sida | Fil | Beskrivning |
|------|-----|-------------|
| IdlePage | `client/src/pages/IdlePage.jsx` | Viloläge med roterande vyer |
| StartPage | `client/src/pages/StartPage.jsx` | Val: gäst/login/register |
| GuestPage | `client/src/pages/GuestPage.jsx` | Gästregistrering (5 initialer) |
| LoginPage | `client/src/pages/LoginPage.jsx` | Inloggning med initialer + PIN |
| RegisterPage | `client/src/pages/RegisterPage.jsx` | Kontoregistrering |

## Contexts

| Context | Fil | Provides |
|---------|-----|----------|
| ThemeContext | `client/src/contexts/ThemeContext.jsx` | theme, changeTheme() - 6 teman |
| AuthContext | `client/src/contexts/AuthContext.jsx` | user, login(), logout() |

## i18n (Internationalization)

| Språk | Fil |
|-------|-----|
| Svenska | `client/src/i18n/locales/sv.json` |
| English | `client/src/i18n/locales/en.json` |
| Dansk | `client/src/i18n/locales/da.json` |
| Deutsch | `client/src/i18n/locales/de.json` |

## Styles

| Fil | Beskrivning |
|-----|-------------|
| `client/src/styles/global.css` | Globala styles + CSS-variabler för alla teman |
| `client/src/styles/themes.css` | Tema-specifika CSS (importeras av global) |
| `client/src/pages/admin/AdminSection.module.css` | CSS Module för admin-sidor |
| `client/src/pages/admin/AdminDashboard.module.css` | CSS Module för admin dashboard |

## Components

| Komponent | Fil | Beskrivning |
|-----------|-----|-------------|
| FileUpload | `client/src/components/FileUpload.jsx` | Bilduppladdning (används av AdminAdvertisements) |

## Key Configuration

| Syfte | Fil |
|-------|-----|
| Vite config | `client/vite.config.js` |
| Client entry | `client/src/main.jsx` |
| Server entry | `server/src/index.js` |
| DB init | `server/src/database/init.js` |

## API Routes

| Route-grupp | Fil |
|-------------|-----|
| Auth | `server/src/routes/auth.js` |
| Admin | `server/src/routes/admin.js` |
| Games | `server/src/routes/games.js` |
| Products | `server/src/routes/products.js` |
| Categories | `server/src/routes/categories.js` |

## Portar

| Tjänst | Port |
|--------|------|
| Backend (Express) | 5250 |
| Frontend (Vite) | 5251 |

---

*Uppdateras automatiskt av Claude via architecture-mapper skill*
