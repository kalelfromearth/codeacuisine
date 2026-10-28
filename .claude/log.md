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
- Agent `regel-waechter` (sonnet, nur lesend) in `.claude/agents/` angelegt; prüft den Code gegen die Regeln aus `CLAUDE.md`. Erster Lauf: 75 Dateien, 1 echter Verstoß (`toggleLike()` 18 Zeilen), 7 Fehlmeldungen zu `routerLink` mit `/` (Regel im Agenten präzisiert).
- Entscheidung: `toggleLike()` (18 Zeilen) bleibt wie es ist.
- n8n-Fehlerbehandlung geprüft: es fehlen Fehler-Workflow mit E-Mail, Wiederholversuch beim KI-Aufruf und die 429-Weitergabe. In n8n gibt es schon die Verbindung "SMTP account".
- n8n: "Call AI" wiederholt einmal bei Fehler (2 Versuche, 2 s); 429 des Anbieters wird als 429 weitergegeben; neuer Workflow `Code a Cuisine - Error Handler` (Error Trigger plus E-Mail über "SMTP account") ist im Hauptworkflow als Error Workflow eingetragen. Test: 200 mit 3 Rezepten, 400 bei falscher Einheit.
- Exporte aktualisiert: `n8n/code-a-cuisine-workflow.json`, neu `n8n/code-a-cuisine-error-handler.json` (Adressen als Platzhalter); `docs/errorhandling.md` angepasst.
- `.gitignore`: `/figma/` und `/*.dc.html` (Figma-Exporte bleiben lokal). Die 2 bereits getrackten Dateien müssen noch per `git rm --cached` aus dem Repo.
- Agent `sicherheits-pruefer` (claude-sonnet-5-5, nur lesend) in `.claude/agents/` angelegt.
- Server-Build (`npm run build:server`) ohne Warnung: main 870 kB, 17 Map-Dateien, base href `/angular-projects/codeacuisine/`; `.htaccess` liegt im Build, gehört nur zur Subdomain.
- Sicherheits-Prüfer lief: 0 hoch, 5 mittel, 3 niedrig. Wichtigste: Angular 21.2.13 patchen, Firebase-Schlüssel einschränken plus Budget-Alarm, Limit im n8n-Workflow, Listenlängen in den Firestore-Regeln, Doku-Satz zur Workflow-Prüfung korrigieren.
- Angular 21.2.13 auf 21.2.25 (cli/build 21.2.29) gehoben: `package.json` Mindestversionen, Lock neu mit `--legacy-peer-deps` aufgelöst (normales `npm install` läuft ohne Konflikt). `npm audit` prod: 10 auf 4 Meldungen, alle Angular-Meldungen weg, übrig nur Firebase/grpc. Produktions-Build ohne Warnung (874 kB), Browser-Test ok (Generieren, Ergebnisse, Detail, Likes, F5).
- Entscheidungen: kein n8n-Limit jetzt (nach der Abnahme). Später: Firestore-Regeln `get` offen, `list` nur mit `limit <= 12`, Listenlängen; Bibliothek zeigt die neuesten 12, lädt beim Scrollen die nächsten 12 (plus Knopf "Mehr laden"); wenige Abrufe, schnelles Laden, Sicherheit haben Vorrang.
- Modellangabe auf Swisscom myAI (`glm-5.3-flash`) korrigiert in `README.md` und `CLAUDE.md` (die ist lokal, nicht im Repo).
- Offen: Test-E-Mail des Fehler-Workflows in n8n von Hand auslösen, README komplett neu (Start, Import des Workflows), Cookbook-Seite, Test-Rezepte in Firestore löschen, ungenutzte Assets entscheiden.
