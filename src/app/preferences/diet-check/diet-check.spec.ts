import { describeUnsuitableIngredients, findUnsuitableIngredients, normalizeForDietCheck } from './diet-check';

const MEAT_AND_FISH = [
  'Thunfisch', 'Tuna', 'Thunfischfilet', 'Thunfisch in Öl', 'Schinken', 'Kochschinken', 'Hähnchenbrust', 'Haehnchen',
  'Hühnerbrühe', 'Rinderhack', 'Rinderhackfleisch', 'Hackfleisch', 'Schweinebauch', 'Schweinefilet', 'Speck',
  'Bacon', 'Garnelen', 'Shrimps', 'Lachs', 'Räucherlachs', 'Lachsfilet', 'Gelatine', 'Schmalz', 'Salami',
  'Chorizo', 'Leberwurst', 'Bratwurst', 'Würstchen', 'Lammkeule', 'Lammfleisch', 'Entenbrust', 'Putenbrust',
  'Kabeljau', 'Sardellen', 'Anchovies', 'Miesmuscheln', 'Jakobsmuscheln', 'Tintenfisch', 'Calamari',
  'Worcestershiresauce', 'Fischsauce', 'Lachsrogen', 'Kaviar', 'Chicken breast', 'Beef', 'Minced beef', 'Pork chops',
  'Turkey', 'Ham', 'Sausage', 'Prosciutto', 'Pancetta', 'Hummer', 'Languste', 'Austern', 'Krabben', 'Wildschwein',
  'Rehbraten', 'Kalbsleber', 'Gänsebrust', 'Rindfleisch', 'Ochsenschwanz', 'Mettwurst', 'Leberkäse', 'Kassler',
  'Fischstäbchen', 'Seelachsfilet', 'Forelle', 'Hering', 'Makrele', 'Scampi', 'Oktopus', 'Hot dog sausage',
  // Added as an independent check, these words were not written into the lists on purpose.
  'Lachsschinken', 'Bockwurst', 'Currywurst', 'Fleischkäse', 'Hackepeter', 'Hähnchenschenkel', 'Hühnerfrikassee',
  'Schweinenacken', 'Rinderfilet', 'Kalbsschnitzel', 'Lammrücken', 'Entenkeule', 'Gänseschmalz', 'Räucherspeck',
  'Frühstücksspeck', 'Blutwurst', 'Wildlachs', 'Seeteufel', 'Seehecht', 'Zander', 'Dorade', 'Wolfsbarsch',
  'Rotbarsch', 'Heilbutt', 'Matjes', 'Bismarckhering', 'Rollmops', 'Tunfisch', 'Thunfischsteak', 'Krabbenfleisch',
  'Bacon bits', 'Pork belly', 'Chicken stock', 'Beef stock', 'Fish stock', 'Lamb shank', 'Duck breast',
  'Smoked salmon', 'King prawns', 'Crab sticks', 'Anchovy fillets', 'Sardines in oil', 'Tuna steak', 'Squid rings',
  'Cod fillet', 'Haddock', 'Swordfish', 'Catfish', 'Crabmeat', 'Hotdog', 'Ground beef', 'Chicken thighs',
];

const ANIMAL_PRODUCTS = [
  'Milch', 'Vollmilch', 'Buttermilch', 'Kuhmilch', 'Milk', 'Käse', 'Frischkäse', 'Ziegenkäse', 'Schafskäse',
  'Cheese', 'Ei', 'Eier', 'Hühnerei', 'Eigelb', 'Eiweiß', 'Egg', 'Eggs', 'Rühreier', 'Joghurt', 'Yogurt', 'Quark',
  'Honig', 'Waldhonig', 'Honey', 'Butter', 'Butterschmalz', 'Sahne', 'Schlagsahne', 'Sour cream', 'Mozzarella',
  'Parmesan', 'Feta', 'Mascarpone', 'Ricotta', 'Mayonnaise', 'Crème fraîche', 'Schmand', 'Skyr', 'Ghee',
  'Milchschokolade', 'Vollmilchschokolade', 'Ice cream', 'Eierschnee', 'Whey', 'Paneer', 'Cottage cheese',
  // Added as an independent check, these words were not written into the lists on purpose.
  'Sauerrahm', 'Eierlikör', 'Milchreis', 'Kondensmilch', 'Bergkäse', 'Hartkäse', 'Cremefraiche', 'Butterkeks',
  'Eiernudeln', 'Spiegelei', 'Rührei', 'Omelett', 'Käsekuchen', 'Heavy cream', 'Whipping cream', 'Cream cheese',
  'Greek yogurt', 'Egg whites', 'Egg yolk', 'Mayo', 'Milk chocolate', 'Doppelrahmfrischkäse', 'Joghurt natur',
  'Magerquark', 'Blütenhonig', 'Akazienhonig',
];

const SUITABLE_FOR_ALL = [
  'Pasta', 'Tomaten', 'Reis', 'Tofu', 'Seitan', 'Tempeh', 'Linsen', 'Kichererbsen', 'Chickpeas', 'Kidney beans',
  'Nierenbohnen', 'Fleischtomate', 'Ochsenherztomate', 'Zitronenrinde', 'Orangenschale', 'Hirse', 'Hirsebrei',
  'Blutorange', 'Gänseblümchen', 'Wild Rice', 'Wildkräuter', 'Muschelnudeln', 'Eierschwammerl', 'Eggplant',
  'Aubergine', 'Eierfrucht', 'Hamburger Brötchen', 'Spinat', 'Kartoffeln', 'Zwiebeln', 'Knoblauch', 'Olivenöl',
  'Erdnussbutter', 'Kokosmilch', 'Sojamilch', 'Hafermilch', 'Mandelmilch', 'Kakaobutter', 'Butternut Kürbis',
  'Honigmelone', 'Margarine', 'Hefeflocken', 'Vegane Butter', 'Veganer Käse', 'Vegane Mayonnaise', 'Fleischersatz',
  'Vegetarische Bratwurst', 'Tofu Wurst', 'Cashewkäse', 'Sojajoghurt', 'Kokosjoghurt', 'Coconut milk', 'Oat milk',
  'Almond milk', 'Peanut butter', 'Cream of tartar', 'Bean curd', 'Hamster', 'Brokkoli', 'Paprika', 'Pfeffer',
  // Added as an independent check, these words were not written into the lists on purpose.
  'Almond flour', 'Cashews', 'Coconut oil', 'Soy sauce', 'Nutritional yeast', 'Sunflower seeds', 'Butter lettuce',
  'Buttercup squash', 'Creamed coconut', 'Sojasauce', 'Kürbiskerne', 'Haferflocken', 'Mehl', 'Zucker', 'Salz',
  'Zitronensaft', 'Basilikum', 'Rosmarin', 'Cherrytomaten', 'Rote Bete', 'Blumenkohl', 'Süßkartoffel', 'Mandeln',
  'Leinsamen', 'Chiasamen', 'Avocado', 'Gurke', 'Karotten', 'Sellerie', 'Lauch', 'Pilze', 'Champignons', 'Mais',
  'Edamame', 'Nori', 'Reisnudeln', 'Vollkornbrot', 'Tomatenmark', 'Gemüsebrühe', 'Rapsöl', 'Apfel', 'Birnen',
];

// Everyday plant foods in German and English. None of them may ever be flagged.
const COMMON_PLANT_FOODS = [
  'Apfel', 'Birne', 'Banane', 'Orange', 'Zitrone', 'Limette', 'Mango', 'Ananas', 'Erdbeeren', 'Himbeeren', 'Blaubeeren',
  'Kirschen', 'Pflaumen', 'Pfirsich', 'Trauben', 'Melone', 'Wassermelone', 'Kiwi', 'Granatapfel', 'Feigen', 'Datteln',
  'Rosinen', 'Kokosnuss', 'Kokosraspel', 'Oliven', 'Kapern', 'Tomate', 'Gurke', 'Zucchini', 'Aubergine', 'Paprika',
  'Peperoni', 'Chili', 'Jalapeño', 'Spargel', 'Spinat', 'Mangold', 'Grünkohl', 'Rotkohl', 'Weißkohl', 'Wirsing',
  'Rosenkohl', 'Brokkoli', 'Blumenkohl', 'Kohlrabi', 'Fenchel', 'Sellerie', 'Staudensellerie', 'Lauch', 'Frühlingszwiebeln',
  'Schalotten', 'Knoblauch', 'Ingwer', 'Kurkuma', 'Karotten', 'Möhren', 'Pastinaken', 'Rote Bete', 'Radieschen',
  'Rettich', 'Kartoffeln', 'Süßkartoffeln', 'Kürbis', 'Hokkaido', 'Mais', 'Erbsen', 'Zuckerschoten', 'Bohnen',
  'Grüne Bohnen', 'Kidneybohnen', 'Kichererbsen', 'Linsen', 'Rote Linsen', 'Sojabohnen', 'Edamame', 'Erdnüsse',
  'Walnüsse', 'Haselnüsse', 'Mandeln', 'Cashewkerne', 'Pistazien', 'Pinienkerne', 'Sonnenblumenkerne', 'Sesam',
  'Leinsamen', 'Chiasamen', 'Hanfsamen', 'Reis', 'Basmatireis', 'Risottoreis', 'Vollkornreis', 'Couscous', 'Bulgur',
  'Quinoa', 'Hirse', 'Haferflocken', 'Dinkel', 'Gerste', 'Buchweizen', 'Polenta', 'Grieß', 'Mehl', 'Weizenmehl',
  'Maismehl', 'Speisestärke', 'Backpulver', 'Hefe', 'Spaghetti', 'Penne', 'Fusilli', 'Tagliatelle', 'Lasagneplatten',
  'Gnocchi', 'Nudeln', 'Reisnudeln', 'Glasnudeln', 'Brot', 'Toast', 'Brötchen', 'Tortillas', 'Fladenbrot', 'Basilikum',
  'Petersilie', 'Schnittlauch', 'Koriander', 'Dill', 'Minze', 'Oregano', 'Thymian', 'Rosmarin', 'Salbei', 'Lorbeer',
  'Curry', 'Kreuzkümmel', 'Zimt', 'Muskat', 'Nelken', 'Kardamom', 'Safran', 'Pfeffer', 'Salz', 'Zucker', 'Vanille',
  'Kakao', 'Zartbitterschokolade', 'Ahornsirup', 'Agavendicksaft', 'Olivenöl', 'Rapsöl', 'Sonnenblumenöl', 'Sesamöl',
  'Kokosöl', 'Essig', 'Balsamico', 'Sojasauce', 'Senf', 'Ketchup', 'Tomatenmark', 'Passierte Tomaten', 'Gemüsebrühe',
  'Tofu', 'Tempeh', 'Seitan', 'Hummus', 'Tahini', 'Miso', 'Wasser', 'Wein', 'Bier', 'Kaffee', 'Tee', 'Apple', 'Pear',
  'Banana', 'Lemon', 'Strawberries', 'Blueberries', 'Pineapple', 'Tomato', 'Cucumber', 'Zucchini squash', 'Eggplant',
  'Bell pepper', 'Spinach', 'Kale', 'Cabbage', 'Cauliflower', 'Celery', 'Leek', 'Garlic', 'Ginger', 'Carrots',
  'Beetroot', 'Potatoes', 'Sweet potatoes', 'Pumpkin', 'Corn', 'Peas', 'Green beans', 'Black beans', 'Lentils',
  'Peanuts', 'Walnuts', 'Almonds', 'Cashew nuts', 'Sesame seeds', 'Brown rice', 'Rice noodles', 'Oats', 'Flour',
  'Baking powder', 'Yeast', 'Spaghetti', 'Bread', 'Basil', 'Parsley', 'Coriander', 'Mint', 'Thyme', 'Cinnamon',
  'Black pepper', 'Sugar', 'Cocoa powder', 'Dark chocolate', 'Maple syrup', 'Olive oil', 'Vinegar', 'Soy sauce',
  'Mustard', 'Tomato paste', 'Vegetable stock', 'Water', 'Wine', 'Coffee', 'Rice flour', 'Mushrooms', 'Pilze',
  'Steinpilze', 'Pfifferlinge', 'Champignons', 'Shiitake', 'Kräuterseitlinge', 'Algen', 'Wakame', 'Kombu', 'Tangerine',
];

const SUITABLE_FOR_VEGETARIAN_ONLY = [
  'Milch', 'Käse', 'Ei', 'Eier', 'Hühnerei', 'Wachtelei', 'Joghurt', 'Quark', 'Honig', 'Butter', 'Sahne',
  'Mozzarella', 'Schafskäse', 'Ziegenkäse', 'Butterschmalz', 'Mayonnaise', 'Cheese', 'Eggs', 'Yogurt', 'Honey',
];

async function findMisses(names: string[], diet: 'vegetarian' | 'vegan', shouldBeFound: boolean): Promise<string[]> {
  const misses: string[] = [];
  for (const name of names) {
    const found = (await findUnsuitableIngredients([name], diet)).length > 0;
    if (found !== shouldBeFound) {
      misses.push(name);
    }
  }
  return misses;
}

describe('findUnsuitableIngredients', function () {
  it('finds meat and fish for Vegetarian and for Vegan', async function () {
    expect(await findMisses(MEAT_AND_FISH, 'vegetarian', true), 'not found for vegetarian').toEqual([]);
    expect(await findMisses(MEAT_AND_FISH, 'vegan', true), 'not found for vegan').toEqual([]);
  });

  it('finds milk, eggs and honey only for Vegan', async function () {
    expect(await findMisses(ANIMAL_PRODUCTS, 'vegan', true), 'not found for vegan').toEqual([]);
  });

  it('allows milk, eggs and honey for Vegetarian', async function () {
    expect(await findMisses(SUITABLE_FOR_VEGETARIAN_ONLY, 'vegetarian', false), 'wrongly found').toEqual([]);
  });

  it('does not flag plant foods and look-alike words for any diet', async function () {
    expect(await findMisses(SUITABLE_FOR_ALL, 'vegetarian', false), 'wrongly found for vegetarian').toEqual([]);
    expect(await findMisses(SUITABLE_FOR_ALL, 'vegan', false), 'wrongly found for vegan').toEqual([]);
  });

  it('does not flag everyday plant foods', async function () {
    expect(await findMisses(COMMON_PLANT_FOODS, 'vegetarian', false), 'wrongly found for vegetarian').toEqual([]);
    expect(await findMisses(COMMON_PLANT_FOODS, 'vegan', false), 'wrongly found for vegan').toEqual([]);
  });

  it('does not check any other diet', async function () {
    expect(await findUnsuitableIngredients(['Thunfisch', 'Käse'], 'none')).toEqual([]);
    expect(await findUnsuitableIngredients(['Thunfisch', 'Käse'], 'keto')).toEqual([]);
  });

  it('returns only the unsuitable ingredients of a list in the order they were entered', async function () {
    const list = ['Pasta', 'Thunfisch', 'Tomaten', 'Käse', 'Schinken'];
    expect(await findUnsuitableIngredients(list, 'vegetarian')).toEqual(['Thunfisch', 'Schinken']);
    expect(await findUnsuitableIngredients(list, 'vegan')).toEqual(['Thunfisch', 'Käse', 'Schinken']);
  });

  it('is fast, even for a long list of ingredients', async function () {
    await findUnsuitableIngredients(['warm up'], 'vegan');
    const longList = Array.from({ length: 200 }, function (_unused, index) {
      return index % 2 === 0 ? 'Rinderhackfleisch' : 'Kartoffeln';
    });
    const start = performance.now();
    await findUnsuitableIngredients(longList, 'vegan');
    expect(performance.now() - start).toBeLessThan(200);
  });
});

describe('normalizeForDietCheck', function () {
  it('writes umlauts, the sharp s and accents in a simple form', function () {
    expect(normalizeForDietCheck('Hähnchen Müßiggang Crème fraîche')).toBe('haehnchen muessiggang creme fraiche');
  });
});

describe('describeUnsuitableIngredients', function () {
  it('writes the message for one, two and more ingredients', function () {
    expect(describeUnsuitableIngredients(['Tuna'], 'vegetarian')).toBe('Tuna does not fit a vegetarian diet.');
    expect(describeUnsuitableIngredients(['Tuna', 'Ham'], 'vegan')).toBe('Tuna and Ham do not fit a vegan diet.');
    expect(describeUnsuitableIngredients(['Tuna', 'Ham', 'Milk'], 'vegan')).toBe(
      'Tuna, Ham and Milk do not fit a vegan diet.',
    );
  });
});
