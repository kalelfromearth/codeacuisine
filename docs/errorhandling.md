# Fehlerbehandlung in Code-a-Cuisine

Überblick, an welchen Stellen die App Fehler abfängt und was die Nutzerin oder der Nutzer dann sieht. Die Prüfung läuft an mehreren Stellen, damit ein Fehler früh auffällt und nichts Ungeprüftes in die Datenbank gelangt.

Den Weg einer Anfrage zeigt diese Reihenfolge:

1. Formular im Browser (Angular)
2. n8n-Workflow (prüft erneut, fragt die KI)
3. Angular speichert in Firestore (Regeln prüfen ein drittes Mal)
4. Anzeige (Ergebnisse, Detailseite, Likes)

## 1. Formular im Browser

Reactive Forms mit Validatoren. Die Fehlermeldung steht direkt am Feld.

| Prüfung | Regel | Meldung |
| --- | --- | --- |
| Zutat leer | Pflichtfeld | "Please enter an ingredient." |
| Zutat unplausibel | `plausibleIngredientName` (z. B. Tastaturmüll, nur Zahlen) | "That doesn't look like an ingredient. Please check the spelling." |
| Menge | ganze Zahl, mindestens 1 | Hinweis am Feld |
| Menge zu groß | Stück 30, ml 5000, g 5000 | "The maximum is …" |
| Zu wenige Zutaten | mindestens 3 | Hinweis "Add at least 3", der Guard `enoughIngredientsGuard` lässt die Preferences-Seite nicht zu |
| Zu viele Zutaten | höchstens 10 | "Add"-Knopf ist gesperrt, Hinweis erscheint |
| Zutat passt nicht zur Diät | Bei Vegetarian (Fleisch, Fisch) und Vegan (zusätzlich Milch, Eier, Honig) prüft `findUnsuitableIngredients` die Namen gegen Wortlisten, erst beim Klick auf "Generate a recipe" | Popup "Ups! Check your diet" mit den betroffenen Zutaten. "Continue without these" schickt die Anfrage ohne sie weiter, nur wenn mindestens 3 Zutaten bleiben |

Der Diät-Check ist ein Hinweis und keine Sperre, er arbeitet nur im Browser. Die Wortlisten (`diet-words.ts`) werden erst beim ersten Check nachgeladen. Namen werden vereinfacht (Kleinbuchstaben, Umlaute als ae/oe/ue, ohne Akzente) und dann als ganzes Wort, Wortanfang oder Wortende verglichen. Ausnahmen wie "Kokosmilch" oder "Erdnussbutter" und Wörter wie "vegan" oder "pflanzlich" machen eine Zutat passend. `diet-check.spec.ts` prüft unter anderem 246 Alltags-Zutaten auf Fehlalarme.

Die Mengengrenzen stehen in `MAX_AMOUNT_BY_UNIT` (`ingredient.model.ts`) und müssen mit dem n8n-Workflow übereinstimmen. Beim Zurücksetzen des Formulars wird die Menge neu geprüft, sonst blieb eine alte Grenze der vorherigen Einheit stehen.

## 2. n8n-Workflow

Datei: `n8n/code-a-cuisine-workflow.json`

Der Workflow prüft die Anfrage erneut. Der Browser allein genügt nicht, weil jeder die Adresse direkt aufrufen kann.

| Antwort | Wann | Inhalt |
| --- | --- | --- |
| 200 | alles gut | `{ status: "ok", recipes: [3 Rezepte] }` |
| 400 | Anfrage ungültig (Knoten "Validate request") | `{ status: "error", errors: [...] }`, z. B. falsche Einheit, Menge außerhalb der Grenzen, unbekannte Küche |
| 422 | Eine KI-Prüfung hält Zutaten für keine Lebensmittel | `{ status: "error", message: "These don't look like ingredients: …" }` |
| 429 | Tageslimit dieser IP erreicht (Knoten "Check daily quota", vor jedem KI-Aufruf) | `{ status: "error", reason: "quota-ip", message: "You have used your 3 recipe requests for today…", limit, remaining: 0 }` |
| 429 | Tageslimit der ganzen App erreicht | `{ status: "error", reason: "quota-total", message: "Code à Cuisine has reached its daily limit…", limit, remaining: 0 }` |
| 429 | Dieselbe IP fragt innerhalb von 30 Sekunden erneut | `{ status: "error", reason: "too-fast", message: "Please wait a few seconds…", retryAfterSeconds }` |
| 429 | Der KI-Anbieter meldet ein Limit (Rate Limit) | `{ status: "error", message: "The AI service is busy at the moment. Please try again in a few minutes." }` |
| 502 | Die KI liefert keine drei brauchbaren Rezepte | `{ status: "error", message: "The AI did not create three usable recipes. Please try again." }` |

Weitere Schutzmaßnahmen im Workflow:

- **Zutatenprüfung:** Ein eigener KI-Aufruf (Temperatur 0) markiert nur eindeutig unsinnige Namen. Im Zweifel gilt ein Name als gültig. Die Antwort wird auf die Zutaten der Anfrage begrenzt.
- **Antwort der KI wird nie ungeprüft weitergegeben.** Der Knoten "Read AI answer" entfernt HTML und Steuerzeichen, kürzt Texte, rundet Zahlen, erzwingt erlaubte Einheiten und begrenzt Mengen auf das, was die Nutzerin hat. Ein Rezept ohne Titel, ohne Schritte oder mit unsinnigen Nährwerten wird verworfen.
- **Checklisten-Regeln für die Zutaten (US 7):** Jedes Rezept nutzt mindestens 70 % der eingegebenen Zutaten, die zur Diät passen, und höchstens 3 Extra-Zutaten. Der Prompt nennt die genaue Zahl. "Read AI answer" zählt nach (Einzahl und Mehrzahl gelten als gleicher Name). Bricht ein Rezept die Regel, bekommt nur dieses Rezept über "Needs another try?" und "Build retry prompt" einen zweiten Versuch mit dem Grund. Die neue Version ersetzt die alte nur, wenn sie die Regeln erfüllt. Danach werden überzählige Extras auf 3 gekürzt, damit es immer drei Rezepte gibt. Zutaten, die die KI wegen der Diät weglässt, meldet sie in `skippedForDiet`. Sie zählen nicht zur 70-%-Basis, so kann die Zählregel die Diät nie aushebeln.
- **Prompt-Injection:** Zutatennamen werden der KI als reine Daten übergeben, mit der Anweisung, nichts davon als Befehl zu behandeln.
- **Zeitlimit und Wiederholung:** Der KI-Aufruf bricht nach 150 Sekunden ab und wird bei einem Fehler **einmal wiederholt** (2 Versuche, 2 Sekunden Pause). Schlägt auch das fehl, läuft der Workflow weiter (`continueRegularOutput`) und meldet am Ende einen 502 oder 429 statt abzustürzen.
- **Fehler-Workflow mit E-Mail:** Stürzt ein Knoten unerwartet ab, startet der Workflow `Code a Cuisine - Error Handler` (`n8n/code-a-cuisine-error-handler.json`). Er besteht aus einem Error Trigger und einer E-Mail mit Workflow-Name, fehlgeschlagenem Knoten, Fehlermeldung, Zeit und Link zur Ausführung. Im Hauptworkflow ist er unter den Einstellungen als "Error Workflow" eingetragen.
- **Parallelität:** Der Anbieter erlaubt höchstens zwei gleichzeitige Aufrufe, deshalb verarbeitet der Knoten "Call AI" je zwei im Block.

- **Tageslimit (US 11, Kostenairbag):** Vor jedem KI-Aufruf prüft "Check daily quota" die Data Table `codeacuisine_quota`: höchstens 3 Durchgänge pro IP und 12 für die ganze App pro Tag (Zürcher Zeit), dazu 30 Sekunden Pause zwischen zwei Durchgängen einer IP. Ein Durchgang ist ein Klick auf "Generate" mit drei Rezepten. Gezählt wird, bevor die KI gefragt wird ("Prepare counters", "Count request"), damit zwei gleichzeitige Anfragen das Limit nicht überholen. Endet der Durchgang mit 422, 429 oder 502, geben "Prepare refund" und "Give quota back" ihn zurück. Gespeichert wird nur ein SHA-256-Hash aus IP und Tag, nie die IP. "Remove old days" löscht frühere Tage. Die IP kommt aus `x-real-ip`, den nginx selbst setzt (`x-forwarded-for` könnte ein Client fälschen), IPv4 in IPv6-Schreibweise (`::ffff:1.2.3.4`) gilt als dieselbe Adresse. Die Grenzen stehen als Konstanten oben in "Check daily quota" und "Describe quota". Zum Zurücksetzen die Zeilen der Data Table löschen.
- **Quota-Status:** `GET …/webhook/code-a-cuisine/quota` antwortet mit `{ status: "ok", limit, remaining }` und zählt nie. Jede erfolgreiche Antwort enthält außerdem `remainingToday`.

## 2a. Zutaten-Vorschläge (n8n)

Datei: `n8n/code-a-cuisine-suggest-workflow.json`, Webhook `GET …/webhook/code-a-cuisine/suggest?q=…`

- **Prüfung:** "Validate query" lässt nur 2 bis 30 Zeichen zu, nur Buchstaben, Leerzeichen, Apostroph und Bindestrich. Sonst kommt sofort eine leere Liste (200, kein Aufruf bei Open Food Facts).
- **Cache:** Jede vollständige Antwort wird 24 Stunden in den Static Data des Workflows gemerkt (höchstens 1500 Einträge, die ältesten fliegen raus). Eine wiederholte Anfrage dauert so etwa 0,2 s statt 1 bis 2 s.
- **Open Food Facts:** Deutsch und Englisch werden gleichzeitig gefragt (Zeitlimit 5 s, `continueRegularOutput`). Fällt eine Sprache aus, liefert die andere trotzdem Treffer. Open Food Facts antwortet bei schnellen Folgeanfragen mit 429. Dann wird nichts gemerkt, und die Antwort bekommt `Cache-Control: no-store`, damit der Browser keine leere Liste eine Stunde lang behält.
- **Bereinigen:** Nur Treffer, deren Wortanfang passt, ohne Verpackungstexte (Zahlen, Klammern, "Aroma", "Konzentrat"), höchstens 25 Zeichen und 3 Wörter, höchstens 6 Treffer.
- **Angular:** `IngredientSuggestionService` fragt erst nach 300 ms Pause und ab 2 Buchstaben, bricht veraltete Anfragen ab und prüft die Antwort (`readSuggestions`: nur kurze Texte, höchstens 6). Bei einem Fehler gibt es einfach keine Vorschläge, die Eingabe funktioniert normal weiter.

## 3. Angular: Anfrage und Speichern

`RecipeGeneratorService` übersetzt jede Antwort in eine verständliche Meldung. Die Ladeseite zeigt sie mit den Knöpfen "Try again" und "Back to preferences".

| Fall | Meldung |
| --- | --- |
| 422 | "Ups! Check your ingredients" mit Link "Back to ingredients" |
| 429 | Meldung des Workflows, zum Beispiel "The AI service is busy at the moment. Please try again in a few minutes." (ohne Meldung: "The daily limit is reached. Please try again tomorrow."). Bei `quota-ip` und `quota-total` heißt die Überschrift "That's it for today", statt "Try again" gibt es "Browse the cookbook" und "Back to the start page". |
| 400 | "Some of your entries are not valid. Please go back and check them." |
| anderer Fehler | "Something went wrong while creating your recipes. Please try again." |
| Zeitüberschreitung nach 120 s | "This is taking too long. Please try again." |
| kein Netz | "We could not reach the recipe service. Please check your connection and try again." |
| Speichern in Firestore schlägt fehl | "We could not save your recipes. Please try again." |

Die Preferences-Seite fragt beim Öffnen den Quota-Status ab (`QuotaService`) und zeigt unter dem Knopf "2 of 3 recipe requests left today". Bei 0 ist der Knopf gesperrt. Schlägt die Abfrage fehl, fehlt nur der Hinweis, die Seite funktioniert normal und n8n prüft trotzdem.

Wichtig beim Speichern: Schlägt es fehl, merkt sich die App die drei fertigen Rezepte. "Try again" speichert sie erneut, ohne die KI noch einmal zu fragen. So entstehen keine unnötigen Kosten.

## 4. Firestore-Regeln

Die Regeln sind die letzte Sicherung, falls jemand die App umgeht.

- Lesen ist für alle erlaubt (Bibliothek ohne Konto).
- Ein neues Rezept darf nur mit genau den erwarteten 12 Feldern, passenden Typen und Längen angelegt werden. `likes` muss 0 sein, `createdAt` ist die Serverzeit.
- Ein Update darf nur `likes` ändern, um genau 1, und nie unter 0.
- Löschen ist verboten, alle anderen Sammlungen sind gesperrt.

Die Regeln können den Inhalt der Listen (Zutaten, Schritte) nicht im Detail prüfen. Das übernimmt der Workflow, bevor Angular speichert. Angular sendet außerdem nur die erlaubten Felder (`pickDocumentFields`).

## 5. Anzeige

- **Detailseite** (`/recipes/:id`): Während des Ladens steht "Loading your recipe...". Ist die ID unbekannt oder schlägt das Laden fehl, erscheint "Ups! This recipe is not available" mit passender Erklärung und einem Link zum Neuerstellen.
- **Neuladen (F5):** Die Detailseite lädt das Rezept per ID aus Firestore. Die Ergebnisseite stellt die drei Rezepte aus den im Tab gemerkten IDs wieder her. Gibt es nichts wiederherzustellen, geht es zurück zur Startseite.
- **Likes:** Der Klick wirkt sofort. Schlägt das Speichern fehl, wird er zurückgenommen. Doppelklicks während des Speicherns werden ignoriert.
- **Speicher im Browser** (`sessionStorage`, `localStorage`): Jeder Zugriff ist abgesichert. Ist der Speicher gesperrt, funktioniert die App weiter, nur ohne gemerkte Ergebnisse oder Herzen.
