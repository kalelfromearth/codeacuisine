# Logbuch

Kurz und knapp, neueste Einträge unten. Format: `Datum – was`.

## 2026-10-28

- Mengen-Fix (Neuprüfung nach Formular-Reset) committet.
- Test-Snippet repariert: fälscht nur noch `/webhook/`, klickt am Ende nicht mehr auf Rezept 1.
- `.htaccess` für die Subdomain (IONOS) in `public/` und `angular.json`; mit `RewriteBase /`.
- Detailseite per Firestore-ID (`/recipes/:id`), Guard `recipeNumberGuard` entfernt.
- Ergebnisseite überlebt F5 (IDs im `sessionStorage`, Wiederherstellung im Guard).
- n8n-Workflow exportiert nach `n8n/code-a-cuisine-workflow.json` (ohne Zugangsdaten).
- `docs/errorhandling.md` angelegt.
- Likes gebaut (`increment`, Herzen im `localStorage`) und im Browser getestet: Liken, Zurücknehmen, F5, anderes Gerät, abgelehnter Klick (Regel verbietet unter 0) ok. Rücknahme stellt jetzt den alten Zustand exakt wieder her.
- Build-Warnung: `recipe-detail.scss` 12,25 kB (Warnschwelle 12 kB, Fehler erst bei 16 kB).
- Budget für Komponenten-Styles auf 14 kB Warnung / 18 kB Fehler angehoben (`angular.json`); Produktions-Build ohne Warnung.
- `STATUS.md` und `TODO.md` liegen jetzt in `docs/`, bleiben per `.gitignore` aus dem Repo (wie `CLAUDE.md`).
- Ordner `.claude/agents/` mit leerer Vorlage `vorlage.md` angelegt (Felder name, description, model, tools).
- Offen: README, `figma/` aus dem Repo, Cookbook-Seite, Test-Rezepte in Firestore löschen.
