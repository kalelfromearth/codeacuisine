
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
  window.fetch = (url, options) => {
    if (!String(url).includes('/webhook/')) {
      return realFetch(url, options);
    }
    window.fetch = realFetch; // The fake answer is used only once, later requests go to n8n again.
    return Promise.resolve(new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } }));
  };

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

