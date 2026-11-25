# Testtag (2026-11-01, abgeschlossen 2026-11-25)

Alles am PC durchgehen. Gefundene Fehler kurz notieren und danach ins Logbuch `.claude/log.md` übernehmen. Haken setzen mit `[x]`.

Zum erneuten Sehen des Better-Life-Knopfs: in den DevTools unter Application, Local Storage den Eintrag `codeacuisine.betterLifeSeen` löschen.

Browser: Chrome, Firefox und Edge. Getestet auf localhost und auf der Live-Seite, Breiten 320, 375, 768, 1440 und 1920 px.

## 1. UI (Aussehen und Layout)

- [x] Startseite: Titel, "Get started", Better-Life-Knopf, Teller-Bild, Link zum Cookbook
- [x] Widescreen ab 1440 px: Inhalt bleibt gleich breit und mittig, Hintergrund über die ganze Breite
- [x] Widescreen Startseite: fünf Teller ab 1440 px
- [x] Zutatenseite und Preferences-Seite
- [x] Ergebnisse (drei Rezepte) und Detailseite
- [x] Cookbook: sieben Kacheln gleich groß, Symbole hinter den Namen (Brezel, Pizza, Rose, Stäbchen, Cloche, Fusion-Zeichen, Klappe)
- [x] Küchen-Listen: Header-Band mit Bildern bei allen sieben Küchen (German, Italian, Indian, Japanese, Gourmet, Fusion, Film)
- [x] Rezeptzeilen am Handy: Nummer im Kreis neben der Kochzeit, jede zweite Zeile beige
- [x] Rezeptzeilen am Desktop: Chips rechts, Hover beige
- [x] Popups (Diät-Check, Better Life, "Not quite enough"): Text lesbar, Knöpfe erreichbar
- [x] Seite für unbekannte Adressen
- [x] Impressum und Datenschutz: Inhalt stimmt, Links von der Startseite und aus der Fußzeile

## 2. Funktionen

- [x] Zutaten hinzufügen, ändern, löschen; Grenzen (3 bis 10 Zutaten, Mengen)
- [x] Liste übersteht F5 in demselben Tab
- [x] Rezepte erzeugen (echter n8n-Aufruf) und Ergebnisse nach F5 wiederherstellen
- [x] Diät-Check Vegetarian + Thunfisch: Popup erscheint, "Continue without these" schickt die Anfrage ohne Thunfisch
- [x] Diät-Check Vegan + Milch: Popup erscheint
- [x] Diät-Check Vegetarian + Käse: kein Popup
- [x] Diät-Check mit weniger als 3 übrigen Zutaten: "Continue without these" fehlt
- [x] Diät-Popup: "Change preferences" schließt, "Change ingredients" führt zur Zutatenseite
- [x] Rezepte werden in Firestore gespeichert, Detailseite per ID
- [x] Herz geben und zurücknehmen bei einem normalen Rezept (Zähler stimmt nach Neuladen)
- [x] Herz geben und zurücknehmen bei einem Film-Rezept (Sammlung `filmLikes`)
- [x] Cookbook: Most liked und Newest umschalten, Karussell (wischen, ziehen, Pfeile)
- [x] Küchen-Liste: Sortierung, Seiten vor und zurück, keine leere letzte Seite, besuchte Seiten laden ohne neue Abfrage
- [x] Film cuisine: sieben feste Rezepte mit Herzen
- [x] Zurück-Links: Detailseite zur Küchen-Liste, zu den Ergebnissen, Cookbook zurück zum Rezept
- [x] Better-Life-Knopf: Popup öffnet, nach dem Schließen ist der Knopf weg, nach Neuladen bleibt er weg
- [x] Drucken: Rezeptkarte und Einkaufsliste, QR-Code mit dem Handy gescannt
- [x] Test-Snippet `docs/test-recipes-snippet.js` läuft und stellt `fetch` wieder her
- [ ] Quota-Anzeige "N of M recipe requests left today" und gesperrter Knopf bei 0 (mit Quota 3/12, nach der Bestätigung der Akademie)
- [ ] "Just a moment" mit Zähler und "That's it for today" (mit Quota 3/12)

## 3. Bedienung (Tastatur und Barrierefreiheit)

- [x] Alles nur mit der Tastatur erreichbar (Tab, Enter, Leertaste, Esc im Popup)
- [x] Sichtbarer Fokus überall, Sprunglink "Skip to content"
- [x] Popups: Fokus bleibt im Popup, Esc und Klick auf den Hintergrund schließen
- [x] Schriften mindestens 16 px, auch am Handy
- [x] Kontrast gut lesbar (Chips, Popups, Header)
- [x] Seitentitel ändert sich bei jedem Seitenwechsel
- [x] Texte und Fehlermeldungen verständlich (Englisch, kurz, ohne Fachwörter)
- [x] Ladezustand und Fehlerfall (Netz aus, n8n nicht erreichbar) sind klar erkennbar, Seite lädt nicht: Meldung mit "Try again"

## 4. Vor dem Upload

- [x] `npx ng test --watch=false` grün (zuletzt 61 Tests)
- [x] `npx ng build` ohne Warnungen
- [x] Firestore-Regeln veröffentlicht (mit `filmLikes` und `limit <= 13`), von außen geprüft am 2026-11-22
- [x] `.htaccess` auf dem Server getestet (Rückweg: Datei in `.htaccess-aus` umbenennen)
- [ ] Nach der Abnahme: Test-Rezepte in Firestore löschen ("List Test …", die Rezepte aus dem Live-Test und aus dem Browser-Test)
- [ ] Nach der Abnahme: API-Key einschränken (zwei Domains plus localhost, nur Cloud Firestore API), Budget-Warnung (Spark oder Blaze klären)
- [ ] Quota in n8n auf 3 pro IP und 12 gesamt stellen (nach der Bestätigung der Akademie)
- [ ] Nach der Abnahme: nginx-Limits, Port 5678 schließen, CORS einschränken (siehe `docs/errorhandling.md`)
