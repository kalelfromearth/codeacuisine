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
- 2026-10-30: Test-Mail des Fehler-Workflows (Execute workflow in n8n) kam an. E-Mail-Teil bestätigt.
- 2026-10-30: Neuer Build (Likes, Detailseite per ID, Angular 21.2.25) auf Unterordner und Subdomain hochgeladen.
- 2026-10-30: Echte Firestore-Regeln geprüft: Listenlängen sind schon drin. Offen nur der Wechsel von `allow read` auf `get` offen und `list` mit `limit <= 12`.
- 2026-10-30: Neue Regeln (`get` offen, `list` nur mit `limit <= 12`) veröffentlicht und von außen getestet: Limit 12 gleich 200, Limit 13 und ohne Limit gleich 403. Sammlung `recipes` war leer (Test-Rezepte gelöscht).
- 2026-10-30: Live-Test beider Seiten (Unterordner und Subdomain) von Andreas durchgeführt: Generieren, Speichern, Ergebnisse, Detailseite, F5 und Likes laufen; das Herz wird im `localStorage` der richtigen ID zugeordnet.
- 2026-10-30: Anleitung zum Einschränken des Firebase-API-Schlüssels gegeben (Websites plus nur Cloud Firestore API); Andreas macht es selbst. Danach Budget-Alarm (Spark oder Blaze klären).
- 2026-10-30: Cookbook, Schritt 1 (Daten laden): `RecipeStoreService` hat `loadMostLiked()` und `loadCuisinePage(cuisine, sort, cursor)` mit `RECIPES_PAGE_SIZE = 12`; Build ohne Fehler. Entscheidungen: 12 pro Seite (Regel bleibt), Auswahlfeld "Meiste Herzen" oder "Neueste", Küchen-Kacheln zuerst als Farbflächen. Test von außen: beliebteste 3 gleich 200; Küche mit Sortierung braucht noch 2 Indizes (Links per Konsole bestätigen).
- 2026-10-30: Cookbook, Schritt 2: Seite `/library` (`src/app/library/`) nach Figma: Kasten mit Titel und Text, "Most liked recipes" als seitlich scrollbare Karten (Daten aus Firestore), sechs Küchen-Kacheln als Farbflächen (verlinken auf `/library/:cuisine`, Seite folgt in Schritt 3), "Generate new recipe". Neu: Mixin `mask-icon`, Farbe `$color-card-soft`, Funktion `buildRecipeTags` (auch von der Detailseite genutzt). Build ohne Warnung, Browser-Test Desktop, 320 und 375 ok.
- 2026-10-30: Ergebnisseite (`/recipes`): freundlicher Hinweis "Still hungry for ideas? …" plus Link "Explore the cookbook" zur Cookbook-Seite, neben "Generate new recipe". Im Figma war dort kein Cookbook-Link, Wunsch von Andreas. Getestet bei Desktop, 320, 375.
- 2026-10-30: Cookbook: ein Streifen mit Umschalter statt zwei Streifen: "Most liked recipes" ist Standard, daneben "Newest recipes"; Klick tauscht die 3 Karten aus (`loadNewest()`, Signal `activeShelf`, Buttons mit `aria-pressed`, `aria-live`). Die erste Idee mit Links auf `/library/most-liked` und `/library/newest` ist verworfen, die Listenseite in Schritt 3 gibt es nur für die sechs Küchen (`library/:cuisine`). Konstante `SHELF_COUNT = 3`.
- 2026-10-30: Cookbook, Schritt 3: Seite `/library/:cuisine` (`src/app/library-list/`): Banner mit Titel (Farbfläche), Auswahlfeld "Sort by" (Most liked oder Newest), Zeilen mit Nummer, Zeit, Titel, Tags und Herz, Pager mit Zurück, Seitenzahlen und Weiter (Seiten werden mit Merkern geblättert, besuchte Seiten kommen aus dem Speicher, 0 Abrufe), "Generate a recipe", Zustände laden, leer, Fehler, unbekannte Küche. 12 pro Seite (`RECIPES_PAGE_SIZE`). Beide Indizes sind aktiv. Getestet mit Seitengröße 4 und 9 Testrezepten (3 Seiten, Zurück, Sortierwechsel), danach wieder 12; Handy 320 und 375 ok. Build ohne Warnung.
- Entscheidung: Osterei "Film cuisine" als Weg A (7 fest eingebaute Rezepte, siehe Liste: Brain on Ice, Confit Byaldi, Treacle Tart, Fünf-Dollar-Milchshake, Second Breakfast, Cubano, Schokoladenfluss), nach Schritt 3.
- 2026-10-30: Build-Warnung (Startpaket 911 kB über 900 kB) behoben: Detailseite, Cookbook und Küchen-Liste werden per `loadComponent` erst bei Bedarf geladen. Startpaket jetzt 863 kB, Lazy-Pakete 25, 13 und 13 kB. Im Browser getestet (Liste, Detail, Cookbook).
- Offen: Detailseite hat nach Klick aus der Küchen-Liste noch keinen Zurück-Link zur Liste (nur zu den Ergebnissen); Test-Rezepte "List Test …" (9 Stück) in Firestore löschen, neue Test-Rezepte aus dem Live-Test in Firestore löschen, README komplett neu (Start, Import des Workflows), Cookbook-Seite, Test-Rezepte in Firestore löschen, ungenutzte Assets entscheiden.
