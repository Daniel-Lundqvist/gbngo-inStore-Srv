# Claude Tasks

> **LAS DENNA FIL FORST VID SESSIONSSTART!**
> Persistent task-tracking som overlever komprimering.

---

## In Progress
*(Nyaste overst)*

(Inga pågående tasks)

---

## Pending
*(Nyaste overst - tasks som vantar)*

(Inga pending tasks)

---

## Done
*(Nyaste overst - klara men inte verifierade)*

(Inga done tasks)

---

## Verified
*(Arkiv - helt klara och verifierade)*

### TASK-003: Admin-meny konfiguration
| Fält | Värde |
|------|-------|
| Prioritet | medium |
| Skapad | 2026-01-09 20:15 |
| Klar | 2026-01-09 21:30 |
| Branch | master |

**Krav uppfyllda:**
1. ✅ Kunna visa/dölja menyer i admin-sidomenyn
2. ✅ Kunna ändra ordning (upp/ner)
3. ✅ UI under Inställningar
4. ✅ Persistent (sparas i settings som JSON)

**Ändringar:**
- `server/src/routes/settings.js`: Ny `/menu-config` endpoint
- `client/src/pages/admin/AdminLayout.jsx`: Läser meny-config och filtrerar/sorterar
- `client/src/pages/admin/AdminSettings.jsx`: Ny UI-sektion för meny-konfiguration
- `client/src/pages/admin/AdminSection.module.css`: CSS för meny-konfiguration
- `client/src/i18n/locales/*.json`: Nya översättningar (4 språk)

**Verifierad:** ✅ (Playwright: döljde Kategorier, flyttade Statistik - sidofältet uppdaterades korrekt)

### TASK-002: Fixa Viloläge (Idle Mode)
| Fält | Värde |
|------|-------|
| Prioritet | high |
| Skapad | 2026-01-09 20:15 |
| Klar | 2026-01-09 20:45 |
| Branch | master |

**Problem löst:**
1. ~~Inställningar ignoreras~~ → Nu respekteras admin-inställningar
2. ~~Procent-logik ologisk~~ → Nu visas relativ fördelning tydligt

**Ändringar:**
- `IdlePage.jsx`: Tog bort fallback till kub, respekterar nu settings
- `AdminSettings.jsx`: Ny UI med "Vikt" och relativ procent-visning
- `i18n/*.json`: Nya översättningar för weight, noViewsEnabled, singleViewEnabled

**Verifierad:** ✅ (Playwright screenshots bekräftar alla tre scenarier)

### TASK-001: Fixa checkbox-spacing i admin/settings
| Fält | Värde |
|------|-------|
| Prioritet | medium |
| Skapad | 2026-01-09 18:30 |
| Klar | 2026-01-09 20:15 |
| Branch | master |

**Resultat:** Ökade gap från 0.5rem till 0.75rem i AdminSection.module.css
**Verifierad:** ✅ (Playwright screenshot bekräftar förbättrad spacing)

### TASK-000: Setup Playwright MCP
| Fält | Värde |
|------|-------|
| Prioritet | high |
| Skapad | 2026-01-09 17:00 |
| Klar | 2026-01-09 18:20 |
| Branch | master |

**Resultat:** Playwright MCP fungerar i VSCode extension via .mcp.json

---

## Quick Reference

**Flytta task:**
- `pending` → `in_progress`: Paborja arbete
- `in_progress` → `done`: Kod klar, behover verifiering
- `done` → `verified`: Verifierad och arkiverad

**Prioritet:** `critical` > `high` > `medium` > `low`
