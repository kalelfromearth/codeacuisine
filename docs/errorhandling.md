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

Die Mengengrenzen stehen in `MAX_AMOUNT_BY_UNIT` (`ingredient.model.ts`) und müssen mit dem n8n-Workflow übereinstimmen. Beim Zurücksetzen des Formulars wird die Menge neu geprüft, sonst blieb eine alte Grenze der vorherigen Einheit stehen.

## 2. n8n-Workflow

Datei: `n8n/code-a-cuisine-workflow.json`

Der Workflow prüft die Anfrage erneut. Der Browser allein genügt nicht, weil jeder die Adresse direkt aufrufen kann.

| Antwort | Wann | Inhalt |
| --- | --- | --- |
| 200 | alles gut | `{ status: "ok", recipes: [3 Rezepte] }` |
| 400 | Anfrage ungültig (Knoten "Validate request") | `{ status: "error", errors: [...] }`, z. B. falsche Einheit, Menge außerhalb der Grenzen, unbekannte Küche |
| 422 | Eine KI-Prüfung hält Zutaten für keine Lebensmittel | `{ status: "error", message: "These don't look like ingredients: …" }` |
| 502 | Die KI liefert keine drei brauchbaren Rezepte | `{ status: "error", message: "The AI did not create three usable recipes. Please try again." }` |

Weitere Schutzmaßnahmen im Workflow:

- **Zutatenprüfung:** Ein eigener KI-Aufruf (Temperatur 0) markiert nur eindeutig unsinnige Namen. Im Zweifel gilt ein Name als gültig. Die Antwort wird auf die Zutaten der Anfrage begrenzt.
- **Antwort der KI wird nie ungeprüft weitergegeben.** Der Knoten "Read AI answer" entfernt HTML und Steuerzeichen, kürzt Texte, rundet Zahlen, erzwingt erlaubte Einheiten und begrenzt Mengen auf das, was die Nutzerin hat. Ein Rezept ohne Titel, ohne Schritte oder mit unsinnigen Nährwerten wird verworfen.
- **Prompt-Injection:** Zutatennamen werden der KI als reine Daten übergeben, mit der Anweisung, nichts davon als Befehl zu behandeln.
- **Zeitlimit:** Der KI-Aufruf bricht nach 150 Sekunden ab. Fällt ein einzelner Aufruf aus, läuft der Workflow weiter (`continueRegularOutput`) und meldet am Ende einen 502 statt abzustürzen.
- **Parallelität:** Der Anbieter erlaubt höchstens zwei gleichzeitige Aufrufe, deshalb verarbeitet der Knoten "Call AI" je zwei im Block.

Nicht umgesetzt: ein Fehler-Trigger mit E-Mail-Benachrichtigung und die Tageslimits pro IP. Die Client-IP wird bereits erfasst, die Begrenzung selbst kommt nach der Abnahme.

## 3. Angular: Anfrage und Speichern

`RecipeGeneratorService` übersetzt jede Antwort in eine verständliche Meldung. Die Ladeseite zeigt sie mit den Knöpfen "Try again" und "Back to preferences".

| Fall | Meldung |
| --- | --- |
| 422 | "Ups! Check your ingredients" mit Link "Back to ingredients" |
| 429 | "The daily limit is reached. Please try again tomorrow." (vorbereitet, der Workflow sendet es noch nicht) |
| 400 | "Some of your entries are not valid. Please go back and check them." |
| anderer Fehler | "Something went wrong while creating your recipes. Please try again." |
| Zeitüberschreitung nach 120 s | "This is taking too long. Please try again." |
| kein Netz | "We could not reach the recipe service. Please check your connection and try again." |
| Speichern in Firestore schlägt fehl | "We could not save your recipes. Please try again." |

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
