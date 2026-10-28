# Testrezepte ohne KI laden (Konsolen-Schnipsel)

Damit du die Detailseite (`/recipes/1` bis `/recipes/3`) ansehen kannst, ohne jedes Mal Zutaten einzutippen und auf die KI zu warten.

Der Schnipsel ersetzt `fetch` auf der Seite durch eine feste Antwort mit drei Testrezepten (2 Köche, 1 Koch, 4 Köche), trägt drei Zutaten ein, klickt sich durch Preferences und die Ladeseite und bleibt am Ende auf der Ergebnisseite mit den 3 Rezepten.

## So benutzt du ihn

1. Dev-Server starten (`npm start`) und `http://localhost:4200/generate-recipe` **frisch** öffnen.
2. Konsole öffnen: F12, Reiter **Console**.
3. Beim ersten Mal blockiert Chrome das Einfügen: `allow pasting` tippen und Enter drücken.
4. Den Block unten kopieren, einfügen, Enter.

## Wichtig

- Gilt nur für **einen** Seitenaufruf. Nach F5 sind die Testrezepte weg, dann den Schnipsel erneut einfügen.
- Der Schnipsel klickt über Klassennamen (`.ingredient-form__add-button`, `.preferences__submit`, `.recipes__card`). Wenn sich diese Namen ändern, muss er angepasst werden.
- Es wird **nichts** an n8n gesendet. Die Rezepte werden aber echt in Firestore gespeichert (3 neue Dokumente pro Durchlauf). Nur der n8n-Aufruf (`/webhook/`) wird ersetzt, alle anderen Anfragen laufen normal.

## Der Schnipsel

```js
(async () => {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const find = (selector) => document.querySelector(selector);

  const makeRecipe = (title, cooks) => ({
    title,
    cookingMinutes: 20,
    timeCategory: 'quick',
    cuisine: 'italian',
    diet: 'vegetarian',
    servings: 2,
    cooks,
    nutrition: { calories: 630, protein: 18, fat: 24, carbs: 58 },
    ingredients: [
      { name: 'Pasta noodles', amount: 80, unit: 'gram', isExtra: false },
      { name: 'Baby spinach', amount: 100, unit: 'gram', isExtra: false },
      { name: 'Cherry tomatoes', amount: 150, unit: 'gram', isExtra: false },
      { name: 'Egg', amount: 1, unit: 'piece', isExtra: false },
      { name: 'Parmesan cheese', amount: 40, unit: 'gram', isExtra: true },
      { name: 'Olive oil', amount: 30, unit: 'ml', isExtra: true },
      { name: 'Herbs (dry basil, oregano, garlic)', amount: 2, unit: 'piece', isExtra: true },
    ],
    steps: [
      'Cook the pasta',
      'Make the sauce',
      'Finish the pasta',
      'Serve and enjoy',
    ].map((stepTitle, index) => ({
      title: stepTitle,
      text: 'Cook your noodles in boiling, salted water, until the pasta is al dente. Drain the pasta and reserve some of the pasta water.',
      chef: (index % cooks) + 1,
    })),
  });

  const body = JSON.stringify({
    status: 'ok',
    recipes: [
      makeRecipe('Pasta with spinach and cherry tomatoes', 2),
      makeRecipe('Creamy garlic shrimp pasta', 1),
      makeRecipe('Pasta alla Trapanese (Sicilian Tomato Pesto)', 4),
    ],
  });
  const realFetch = window.fetch.bind(window);
  window.fetch = (url, options) =>
    String(url).includes('/webhook/')
      ? Promise.resolve(new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } }))
      : realFetch(url, options);

  for (const name of ['Pasta', 'Egg', 'Tomato']) {
    const input = find('#ingredient-name');
    input.value = name;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    find('.ingredient-form__add-button').click();
    await wait(150);
  }
  find('app-button .btn').click();
  await wait(900);
  find('.preferences__submit app-button .btn').click();
})();
```

## Andere Rezepte ansehen

Nach dem Schnipsel stehst du auf der Ergebnisseite. Von dort öffnest du mit **View** Rezept 1 (2 Köche), Rezept 2 (1 Koch) oder Rezept 3 (4 Köche). Die Adresse in der Adressleiste direkt zu ändern geht **nicht**, weil die Seite dann neu lädt und die Testrezepte weg sind.
