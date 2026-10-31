# Testtag (2026-11-01)

Alles am PC durchgehen. Gefundene Fehler kurz notieren und danach ins Logbuch `.claude/log.md` übernehmen. Haken setzen mit `[x]`.

Zum erneuten Sehen des Better-Life-Knopfs: in den DevTools unter Application, Local Storage den Eintrag `codeacuisine.betterLifeSeen` löschen.

## 1. UI (Aussehen und Layout)

Jeweils bei 320, 375, 768, 1440 und 1920 px prüfen.

- [ ] Startseite: Titel, "Get started", Better-Life-Knopf, Teller-Bild, Link zum Cookbook
- [ ] Widescreen ab 1440 px: Inhalt bleibt gleich breit und mittig, Hintergrund über die ganze Breite
- [ ] Widescreen Startseite: fünf Teller aus den Figma-Components (Figma-Link fehlt noch, Breakpoint 1440 px fehlt noch)
- [ ] Zutatenseite und Preferences-Seite
- [ ] Ergebnisse (drei Rezepte) und Detailseite
- [ ] Cookbook: sieben Kacheln gleich groß, Symbole hinter den Namen (Brezel, Pizza, Rose, Stäbchen, Cloche, Fusion-Zeichen, Klappe)
- [ ] Küchen-Listen: Header-Band mit Bildern bei allen sieben Küchen (German, Italian, Indian, Japanese, Gourmet, Fusion, Film)
- [ ] Rezeptzeilen am Handy: Nummer im Kreis neben der Kochzeit, jede zweite Zeile beige
- [ ] Rezeptzeilen am Desktop: Chips rechts, Hover beige
- [ ] Popups (Diät-Check, Better Life, "Not quite enough"): Text lesbar, Knöpfe erreichbar
- [ ] Seite für unbekannte Adressen

## 2. Funktionen

- [ ] Zutaten hinzufügen, ändern, löschen; Grenzen (3 bis 10 Zutaten, Mengen)
- [ ] Liste übersteht F5 in demselben Tab
- [ ] Rezepte erzeugen (echter n8n-Aufruf) und Ergebnisse nach F5 wiederherstellen
- [ ] Diät-Check Vegetarian + Thunfisch: Popup erscheint, "Continue without these" schickt die Anfrage ohne Thunfisch
- [ ] Diät-Check Vegan + Milch: Popup erscheint
- [ ] Diät-Check Vegetarian + Käse: kein Popup
- [ ] Diät-Check mit weniger als 3 übrigen Zutaten: "Continue without these" fehlt
- [ ] Rezepte werden in Firestore gespeichert, Detailseite per ID
- [ ] Herz geben und zurücknehmen bei einem normalen Rezept (Zähler stimmt nach Neuladen)
- [ ] Herz geben und zurücknehmen bei einem Film-Rezept (Sammlung `filmLikes`)
- [ ] Cookbook: Most liked und Newest umschalten
- [ ] Küchen-Liste: Sortierung, Seiten vor und zurück, besuchte Seiten laden ohne neue Abfrage
- [ ] Film cuisine: sieben feste Rezepte mit Herzen
- [ ] Zurück-Links: Detailseite zur Küchen-Liste, zu den Ergebnissen, Cookbook zurück zum Rezept
- [ ] Better-Life-Knopf: Popup öffnet, nach dem Schließen ist der Knopf weg, nach Neuladen bleibt er weg
- [ ] Test-Snippet `docs/test-recipes-snippet.js` läuft und stellt `fetch` wieder her

## 3. Bedienung (Tastatur und Barrierefreiheit)

- [ ] Alles nur mit der Tastatur erreichbar (Tab, Enter, Leertaste, Esc im Popup)
- [ ] Sichtbarer Fokus überall, Sprunglink "Skip to content"
- [ ] Popups: Fokus bleibt im Popup, Esc und Klick auf den Hintergrund schließen
- [ ] Schriften mindestens 16 px, auch am Handy
- [ ] Kontrast gut lesbar (Chips, Popups, Header)
- [ ] Seitentitel ändert sich bei jedem Seitenwechsel
- [ ] Texte und Fehlermeldungen verständlich (Englisch, kurz, ohne Fachwörter)
- [ ] Ladezustand und Fehlerfall (Netz aus, n8n nicht erreichbar) sind klar erkennbar

## 4. Vor dem Upload

- [ ] `npx ng test --watch=false` grün (zuletzt 28 Tests)
- [ ] `npx ng build` ohne Warnungen
- [ ] Firestore-Regeln veröffentlicht (mit `filmLikes`), Stand 2026-10-31 erledigt
- [ ] `.htaccess` auf dem Server testen (Rückweg: Datei in `.htaccess-aus` umbenennen)
- [ ] Test-Rezepte in Firestore löschen ("List Test …" und die Rezepte aus dem Live-Test)
- [ ] Offen für den Schluss: API-Key einschränken, Budget-Warnung, Tageslimit in n8n, CORS im n8n-Webhook
