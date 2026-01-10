# Dead Files Report - Client Folder

**Körning:** 2026-01-10
**Projekt:** gbngo-inStore
**Scope:** client/ folder only
**Analyserade filer:** 78 (exkl. node_modules, dist)
**Git commit:** `555cb86` (2026-01-10 01:17:08)

---

## Sammanfattning

| Status | Antal |
|--------|-------|
| DEAD FILE → Flyttade | 5 |
| .gitkeep → Borttagna (onödiga) | 6 |
| .gitkeep → Bevarade (tomma mappar) | 2 |
| BEHÖVS → Redan OK | 65 |

---

## Ignorerade (blocklist)

- `node_modules/` (~15,000+ filer)
- `dist/` (build output)
- `package-lock.json` (auto-genererad)

---

## client/src/pages/

**DEAD FILE → Flyttade till docs/dead-files/client/:**
> `GamePlayPage.jsx.new` - Gammal placeholder-version, ersatt av nuvarande fullständiga implementation
> `DashboardPage.jsx.bak` - Backup med framer-motion dependency

---

## client/src/pages/admin/

**DEAD FILE → Flyttade till docs/dead-files/client/:**
> `AdminLayout.jsx.bak` - Backup utan "games" i sidomenyn
> `AdminProducts.jsx.bak` - Backup före senaste ändringar

---

## client/src/pages/ (CSS)

**DEAD FILE → Flyttade till docs/dead-files/client/:**
> `ControllerPage.module.css.bak` - CSS backup före styling-ändringar

---

## .gitkeep filer

**.gitkeep → Borttagna (mappar har innehåll nu):**
> `client/src/components/.gitkeep` - Mappen har 8+ komponenter
> `client/src/pages/.gitkeep` - Mappen har 20+ sidor
> `client/src/contexts/.gitkeep` - Mappen har AuthContext + ThemeContext
> `client/src/hooks/.gitkeep` - Mappen har useIdleTimeout + useFetch
> `client/src/styles/.gitkeep` - Mappen har global.css
> `client/src/i18n/.gitkeep` - Mappen har i18n.js + locales/

**.gitkeep → Bevarade (tomma mappar för framtida bruk):**
> `client/src/themes/.gitkeep` - Tom mapp, behövs för temahantering senare
> `client/src/utils/.gitkeep` - Tom mapp, behövs för utilities senare

---

## Verifierade som BEHÖVS

### Komponenter (client/src/components/)
| Fil | Används av |
|-----|-----------|
| `LanguageSwitcher.jsx` | DashboardPage, GamesPage |
| `GameCube.jsx` | IdlePage, IdleViews |
| `ProgressBar.jsx` | FileUpload |
| `FileUpload.jsx` | AdminAdvertisements |
| `ErrorWithRetry.jsx` | ProductsPage, TimeoutTestPage |
| `IdleViews/*` | IdlePage |

### Sidor (client/src/pages/)
| Fil | Route/Import |
|-----|--------------|
| `ValidatedGamePlayPage.jsx` | `/games/:gameSlug/play` |
| `GamePlayPage.jsx` | Importeras av ValidatedGamePlayPage |
| `ControllerTestPage.jsx` | `/controller-test` |
| `TimeoutTestPage.jsx` | `/timeout-test` |
| `AuthPage.module.css` | Delad CSS för RegisterPage, LoginPage, GuestPage, AdminLoginPage |

### Hooks (client/src/hooks/)
| Fil | Används av |
|-----|-----------|
| `useIdleTimeout.js` | main.jsx (IdleTimeoutWrapper) |
| `useFetch.js` | ProductsPage, TimeoutTestPage |

### Contexts (client/src/contexts/)
| Fil | Används av |
|-----|-----------|
| `AuthContext.jsx` | main.jsx, App.jsx, många komponenter |
| `ThemeContext.jsx` | main.jsx |

### i18n (client/src/i18n/)
| Fil | Används av |
|-----|-----------|
| `i18n.js` | main.jsx |
| `locales/*.json` | i18n-systemet (sv, en, da, de) |

---

## Frågetecken (kräver manuell granskning)

(inga denna körning)

---

## Rekommendationer

1. ✅ **Backups borde aldrig committas** - Använd git för versionshantering istället för .bak-filer
2. ⚠️ **themes/ och utils/ är tomma** - Överväg att ta bort om de inte planeras användas snart
3. ℹ️ **AuthPage.module.css** - Namn är missvisande, används som delad auth-styling. Överväg rename till `shared-auth.module.css`

---

*Genererad av /dead-files-finder*
