import { Recipe } from './recipe.model';

/** The film a dish is inspired by. The scene is written in our own words. */
export interface FilmInfo {
  title: string;
  year: number;
  scene: string;
}

/** A fixed recipe of the film cuisine. It is not stored in Firestore and cannot get hearts. */
export interface FilmRecipe extends Recipe {
  film: FilmInfo;
}

/** The name of the film cuisine in the address, for example /library/film. */
export const FILM_CUISINE = 'film';

const FILM_RECIPE_DATE = '2026-10-30T00:00:00.000Z';

export const FILM_RECIPES: readonly FilmRecipe[] = [
  {
    id: 'film-brain-on-ice',
    film: {
      title: 'Indiana Jones and the Temple of Doom',
      year: 1984,
      scene: 'At a palace banquet, a very unusual chilled dessert is served in a fancy bowl. Ours is made of raspberries.',
    },
    title: 'Brain on Ice',
    cookingMinutes: 25,
    timeCategory: 'medium',
    cuisine: 'fusion',
    diet: 'vegetarian',
    servings: 2,
    cooks: 1,
    nutrition: { calories: 520, protein: 8, fat: 36, carbs: 40 },
    ingredients: [
      { name: 'Raspberries', amount: 250, unit: 'gram', isExtra: false },
      { name: 'Double cream', amount: 300, unit: 'ml', isExtra: false },
      { name: 'Milk', amount: 100, unit: 'ml', isExtra: false },
      { name: 'Sugar', amount: 60, unit: 'gram', isExtra: true },
      { name: 'Gelatine leaves', amount: 4, unit: 'piece', isExtra: true },
      { name: 'Vanilla extract', amount: 5, unit: 'ml', isExtra: true },
      { name: 'Ice cubes', amount: 300, unit: 'gram', isExtra: true },
    ],
    steps: [
      { title: 'Soak the gelatine', text: 'Put the gelatine leaves in cold water for 5 minutes until they are soft.', chef: 1 },
      { title: 'Make the cream', text: 'Warm the cream, milk, sugar and vanilla until the sugar has melted. Do not boil. Stir in the squeezed gelatine.', chef: 1 },
      { title: 'Shape the brain', text: 'Pour the cream into a brain shaped mould or a small bowl and chill it for at least 4 hours.', chef: 1 },
      { title: 'Make the red sauce', text: 'Blend the raspberries with a little sugar and push the sauce through a sieve.', chef: 1 },
      { title: 'Serve on ice', text: 'Turn the brain out onto a bowl of ice cubes and pour the raspberry sauce over it.', chef: 1 },
    ],
    likes: 0,
    createdAt: FILM_RECIPE_DATE,
  },
  {
    id: 'film-confit-byaldi',
    film: {
      title: 'Ratatouille',
      year: 2007,
      scene: 'A little chef turns simple vegetables into an elegant spiral and wins over a strict food critic.',
    },
    title: 'Confit Byaldi',
    cookingMinutes: 60,
    timeCategory: 'complex',
    cuisine: 'fusion',
    diet: 'vegan',
    servings: 2,
    cooks: 2,
    nutrition: { calories: 260, protein: 6, fat: 14, carbs: 28 },
    ingredients: [
      { name: 'Zucchini', amount: 200, unit: 'gram', isExtra: false },
      { name: 'Eggplant', amount: 200, unit: 'gram', isExtra: false },
      { name: 'Tomatoes', amount: 300, unit: 'gram', isExtra: false },
      { name: 'Red bell pepper', amount: 1, unit: 'piece', isExtra: false },
      { name: 'Garlic cloves', amount: 2, unit: 'piece', isExtra: true },
      { name: 'Olive oil', amount: 40, unit: 'ml', isExtra: true },
      { name: 'Fresh thyme', amount: 3, unit: 'gram', isExtra: true },
    ],
    steps: [
      { title: 'Slice the vegetables', text: 'Cut the zucchini, eggplant and two tomatoes into very thin, even rounds.', chef: 1 },
      { title: 'Make the pepper sauce', text: 'Roast the pepper, peel it and blend it with the remaining tomatoes, garlic and a little oil. Spread it in a baking dish.', chef: 2 },
      { title: 'Build the spiral', text: 'Stand the slices upright in an overlapping spiral on top of the sauce.', chef: 1 },
      { title: 'Bake slowly', text: 'Brush with oil, add thyme and cover with baking paper. Bake at 140 degrees Celsius for 45 minutes.', chef: 2 },
    ],
    likes: 0,
    createdAt: FILM_RECIPE_DATE,
  },
  {
    id: 'film-treacle-tart',
    film: {
      title: 'Harry Potter and the Philosopher’s Stone',
      year: 2001,
      scene: 'A young wizard is dazzled by a long table full of sweets in a huge candlelit hall.',
    },
    title: 'Treacle Tart',
    cookingMinutes: 55,
    timeCategory: 'complex',
    cuisine: 'fusion',
    diet: 'vegetarian',
    servings: 2,
    cooks: 2,
    nutrition: { calories: 540, protein: 6, fat: 20, carbs: 84 },
    ingredients: [
      { name: 'Flour', amount: 200, unit: 'gram', isExtra: false },
      { name: 'Butter', amount: 100, unit: 'gram', isExtra: false },
      { name: 'Golden syrup', amount: 300, unit: 'gram', isExtra: false },
      { name: 'Breadcrumbs', amount: 100, unit: 'gram', isExtra: true },
      { name: 'Lemon', amount: 1, unit: 'piece', isExtra: true },
      { name: 'Egg', amount: 1, unit: 'piece', isExtra: true },
    ],
    steps: [
      { title: 'Make the pastry', text: 'Rub the butter into the flour, add the egg and a splash of cold water and knead to a smooth dough. Rest it for 15 minutes.', chef: 1 },
      { title: 'Prepare the filling', text: 'Warm the golden syrup and stir in the breadcrumbs, the lemon zest and a spoonful of lemon juice.', chef: 2 },
      { title: 'Fill the tart', text: 'Line a tart tin with the pastry and pour in the filling. Decorate with thin strips of pastry.', chef: 1 },
      { title: 'Bake', text: 'Bake at 180 degrees Celsius for 25 minutes until golden. Serve warm.', chef: 2 },
    ],
    likes: 0,
    createdAt: FILM_RECIPE_DATE,
  },
  {
    id: 'film-five-dollar-milkshake',
    film: {
      title: 'Pulp Fiction',
      year: 1994,
      scene: 'Two people share a retro diner booth and order a very pricey vanilla shake.',
    },
    title: 'The Five Dollar Milkshake',
    cookingMinutes: 5,
    timeCategory: 'quick',
    cuisine: 'fusion',
    diet: 'vegetarian',
    servings: 2,
    cooks: 1,
    nutrition: { calories: 610, protein: 12, fat: 30, carbs: 72 },
    ingredients: [
      { name: 'Vanilla ice cream', amount: 300, unit: 'gram', isExtra: false },
      { name: 'Whole milk', amount: 150, unit: 'ml', isExtra: false },
      { name: 'Vanilla extract', amount: 5, unit: 'ml', isExtra: true },
      { name: 'Whipped cream', amount: 30, unit: 'gram', isExtra: true },
      { name: 'Cherries', amount: 2, unit: 'piece', isExtra: true },
    ],
    steps: [
      { title: 'Blend', text: 'Blend the ice cream, milk and vanilla for 30 seconds until thick and smooth.', chef: 1 },
      { title: 'Top and serve', text: 'Pour into tall glasses, top with whipped cream and a cherry and serve with a straw.', chef: 1 },
    ],
    likes: 0,
    createdAt: FILM_RECIPE_DATE,
  },
  {
    id: 'film-second-breakfast',
    film: {
      title: 'The Lord of the Rings: The Fellowship of the Ring',
      year: 2001,
      scene: 'Two hungry hobbits insist that one breakfast a day is simply not enough.',
    },
    title: 'Second Breakfast',
    cookingMinutes: 30,
    timeCategory: 'medium',
    cuisine: 'fusion',
    diet: 'none',
    servings: 2,
    cooks: 2,
    nutrition: { calories: 640, protein: 28, fat: 36, carbs: 48 },
    ingredients: [
      { name: 'Potatoes', amount: 300, unit: 'gram', isExtra: false },
      { name: 'Mushrooms', amount: 200, unit: 'gram', isExtra: false },
      { name: 'Bacon', amount: 100, unit: 'gram', isExtra: false },
      { name: 'Eggs', amount: 2, unit: 'piece', isExtra: false },
      { name: 'Butter', amount: 20, unit: 'gram', isExtra: true },
      { name: 'Fresh parsley', amount: 5, unit: 'gram', isExtra: true },
    ],
    steps: [
      { title: 'Boil and mash the potatoes', text: 'Boil the potatoes until soft, drain them and mash them with half of the butter.', chef: 1 },
      { title: 'Fry the bacon and mushrooms', text: 'Fry the bacon until crisp, then add the sliced mushrooms and cook for 5 minutes.', chef: 2 },
      { title: 'Cook the eggs', text: 'Fry the eggs in the remaining butter until the whites are set.', chef: 2 },
      { title: 'Serve', text: 'Pile the mash on two plates, add the mushrooms, bacon and eggs and sprinkle with parsley.', chef: 1 },
    ],
    likes: 0,
    createdAt: FILM_RECIPE_DATE,
  },
  {
    id: 'film-cubano-sandwich',
    film: {
      title: 'Chef',
      year: 2014,
      scene: 'A chef starts a food truck and a pressed sandwich becomes the star of a road trip.',
    },
    title: 'Cubano Sandwich',
    cookingMinutes: 20,
    timeCategory: 'quick',
    cuisine: 'fusion',
    diet: 'none',
    servings: 2,
    cooks: 1,
    nutrition: { calories: 720, protein: 42, fat: 34, carbs: 62 },
    ingredients: [
      { name: 'Sandwich rolls', amount: 2, unit: 'piece', isExtra: false },
      { name: 'Roast pork', amount: 150, unit: 'gram', isExtra: false },
      { name: 'Ham', amount: 100, unit: 'gram', isExtra: false },
      { name: 'Swiss cheese', amount: 100, unit: 'gram', isExtra: false },
      { name: 'Pickles', amount: 40, unit: 'gram', isExtra: true },
      { name: 'Yellow mustard', amount: 20, unit: 'gram', isExtra: true },
      { name: 'Butter', amount: 20, unit: 'gram', isExtra: true },
    ],
    steps: [
      { title: 'Fill the rolls', text: 'Cut the rolls open, spread them with mustard and layer pork, ham, cheese and pickles.', chef: 1 },
      { title: 'Butter the outside', text: 'Spread the butter thinly on the outside of the rolls.', chef: 1 },
      { title: 'Press and toast', text: 'Toast the sandwiches in a hot pan under a heavy pan or plate for 3 minutes per side until the cheese melts.', chef: 1 },
    ],
    likes: 0,
    createdAt: FILM_RECIPE_DATE,
  },
  {
    id: 'film-chocolate-river-fondue',
    film: {
      title: 'Charlie and the Chocolate Factory',
      year: 2005,
      scene: 'Visitors tour a candy factory where a whole river is made of melted chocolate.',
    },
    title: 'Chocolate River Fondue',
    cookingMinutes: 15,
    timeCategory: 'quick',
    cuisine: 'fusion',
    diet: 'vegetarian',
    servings: 2,
    cooks: 2,
    nutrition: { calories: 680, protein: 9, fat: 40, carbs: 70 },
    ingredients: [
      { name: 'Dark chocolate', amount: 200, unit: 'gram', isExtra: false },
      { name: 'Strawberries', amount: 200, unit: 'gram', isExtra: false },
      { name: 'Bananas', amount: 2, unit: 'piece', isExtra: false },
      { name: 'Cream', amount: 150, unit: 'ml', isExtra: true },
      { name: 'Butter biscuits', amount: 100, unit: 'gram', isExtra: true },
      { name: 'Marshmallows', amount: 60, unit: 'gram', isExtra: true },
    ],
    steps: [
      { title: 'Melt the chocolate', text: 'Chop the chocolate and melt it gently with the cream over a bowl of hot water. Stir until smooth.', chef: 1 },
      { title: 'Prepare the dippers', text: 'Wash the strawberries and cut the bananas into thick slices. Arrange them with the biscuits and marshmallows.', chef: 2 },
      { title: 'Dip and enjoy', text: 'Pour the chocolate into a warm bowl and dip everything into your chocolate river.', chef: 2 },
    ],
    likes: 0,
    createdAt: FILM_RECIPE_DATE,
  },
];

/** Returns the film recipe with the given id, or undefined when the id belongs to another recipe. */
export function findFilmRecipe(id: string): FilmRecipe | undefined {
  return FILM_RECIPES.find(function (recipe) {
    return recipe.id === id;
  });
}

/** Returns true when the recipe is a fixed recipe of the film cuisine. */
export function isFilmRecipe(recipe: Recipe): recipe is FilmRecipe {
  return 'film' in recipe;
}
