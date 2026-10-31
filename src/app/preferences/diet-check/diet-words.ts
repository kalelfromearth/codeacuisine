/**
 * Word lists for the diet check. They are written in normal spelling with umlauts, the check writes both
 * the lists and the ingredients in the same simple form (ae, oe, ue, ss, no accents) before it compares them.
 * This file is only loaded when the user clicks "Generate a recipe" with Vegetarian or Vegan selected.
 */
export interface DietWordList {
  /** The whole word, for example "ham" finds "ham" but not "hamster". */
  whole: string[];
  /** The start of a word, for example "rinder" finds "Rinderhack". */
  prefix: string[];
  /** The end of a word, for example "fisch" finds "Thunfisch". */
  suffix: string[];
  /** Anywhere in the text, only for long words that cannot be part of another food. */
  contains: string[];
  /** Phrases that look similar but are fine, for example "Kokosmilch". They are removed before the search. */
  allowed: string[];
  /** Words like "vegan" that make an ingredient suitable, for example "vegane Butter". */
  markers: string[];
}

function words(text: string): string[] {
  return text.trim().split(/\s+/);
}

function phrases(text: string): string[] {
  return text.split('|').map(function (phrase) {
    return phrase.trim();
  });
}

/** Meat, fish, seafood and other parts of dead animals. Not allowed for Vegetarian and for Vegan. */
export const MEAT_AND_FISH: DietWordList = {
  whole: words(`
    fleisch meat hack mett gehacktes speck schinken wurst salami bacon ham sausage sausages
    rind kalb schwein lamm schaf hammel ziege huhn hahn pute ente gans taube wachtel fasan rebhuhn hase kaninchen
    reh hirsch elch bison chicken beef pork veal lamb mutton turkey duck goose quail pheasant pigeon rabbit hare
    venison boar deer
    fisch fish thun aal lachs salmon tuna cod trout hering herring sardine sardinen anchovis anchovy anchovies
    makrele mackerel forelle karpfen zander hecht barsch dorsch scholle kabeljau seelachs heilbutt halibut dorade
    seezunge steinbutt sprotte sprotten rogen roe kaviar caviar surimi wels stint saibling
    garnele garnelen shrimp shrimps prawn prawns scampi krabbe krabben crab krebs hummer lobster languste muschel
    muscheln mussel mussels auster austern oyster oysters tintenfisch kalmar calamari squid oktopus octopus krake
    scallop scallops clam clams seafood meeresfruechte schalentiere shellfish krill escargot froschschenkel
    gelatine gelatin schmalz lard talg tallow suet knochenmark innereien offal leber liver niere nieren kutteln tripe
    chorizo pepperoni pancetta prosciutto mortadella bresaola guanciale lardo kassler kasseler leberkaese lyoner
    mettwurst landjaeger cabanossi wiener krakauer frikadelle frikadellen bulette buletten hackbraten hackepeter
    meatballs meatball meatloaf doener doner gyros schawarma shawarma jerky biltong pastrami karmin carmine
    cochenille schellack rippchen spareribs ribs brisket sirloin ribeye tenderloin
    haddock pollock pollack tilapia snapper bass mullet turbot monkfish eel pike perch carp sturgeon hotdog
  `),
  prefix: words(`
    fleisch rinder rinds rindfleisch rindsteak kalbs kalbfleisch schwein lamm hammel huehn haehn pute puten truthahn
    truthaehne enten gaense tauben wachtelbrust wachtelfleisch fasanen rebhuehn hasen kaninchen rehruecken rehkeule
    rehbraten rehfleisch rehgulasch rehsteak hirsch wildfleisch wildschwein wildgulasch wildragout wildbraten
    wildente wildhase wildkaninchen schinken speck wurst wuerst salami leber bacon beef pork chicken turkey lamb veal
    duck goose sausage meat mincemeat
    fisch fish lachs forelle karpfen zander hecht barsch dorsch scholle kabeljau seelachs seehecht seeteufel
    heilbutt makrele hering sardine sardelle anchov saibling dorade wolfsbarsch kaviar rogen meeresfrucht seafood
    schalentier garnele shrimp prawn scampi krabbe krebs hummer langust muschel auster kalmar calamari oktopus octopus
    krake scallop squid cuttlefish langoustine crayfish lobster crab
    gelatin schmalz talg knochen worcester fleischbruehe ochsen matjes rollmops hotdog
  `),
  suffix: words(`
    fleisch fisch wurst schinken speck muschel muscheln schmalz talg knochen lachs rogen forelle huhn hahn leber
    keule haxe haxen rippchen barsch hering hecht dorsch scholle fish meat
  `),
  contains: words(`
    thunfisch hackfleisch rindfleisch schweinefleisch haehnchen schinken garnele meeresfrucht kabeljau sardine sardelle
    anchov tintenfisch gelatine leberwurst bratwurst salami chorizo pancetta prosciutto mortadella
  `),
  allowed: phrases(
    'huehnerei|huehnereier|huehnereiweiss|huehnereigelb|enteneier|entenei|gaenseei|gaenseeier|wachtelei|wachteleier|' +
      'perlhuhnei|fleischtomate|fleischtomaten|ochsenherz|fleischlos|fleischfrei|fleischersatz|fischfrei|fischersatz|' +
      'muschelnudeln|muschelpasta|butterschmalz|gaensebluemchen|gaensedistel|gaensefuss|gaensekresse|crab apple|crabapple',
  ),
  markers: words(`
    vegan vegetarisch vegetarian veggie pflanzlich plant-based plantbased fleischlos fleischfrei fischfrei meat-free
    meatless ersatz alternative alternativ tofu soja
  `),
};

/** Milk, eggs, honey and other products of animals. Not allowed for Vegan, but fine for Vegetarian. */
export const ANIMAL_PRODUCTS: DietWordList = {
  whole: words(`
    ei eier egg eggs milch milk sahne cream creamer rahm obers schmand butter kaese cheese quark topfen skyr joghurt
    jogurt yoghurt yogurt kefir ayran lassi molke whey kasein casein laktose lactose ghee buttermilk custard curd
    curds fraiche mayo mayonnaise majonaese aioli remoulade hollandaise bearnaise honig honey paneer gelato eiscreme
    baiser meringue yolk albumen omelett omelette omelet
    parmesan parmigiano grana pecorino mozzarella gouda edamer emmentaler emmental gruyere cheddar brie camembert feta
    halloumi ricotta mascarpone gorgonzola provolone manchego roquefort tilsiter tilsit appenzeller fontina taleggio
    asiago burrata stracciatella scamorza harzer limburger muenster leerdammer maasdam jarlsberg havarti raclette
    bienenwachs beeswax propolis
  `),
  prefix: words(`
    eier eigelb eiweiss eiklar eischnee eipulver huehnerei wachtelei entenei gaensei egg milch vollmilch magermilch
    kuhmilch ziegenmilch schafmilch sahne schlagsahne kochsahne rahm butter kaese joghurt jogurt yoghurt yogurt quark
    buttermilch milk cheese honig bienen whey mayonnaise majonaese
  `),
  suffix: words(`
    milch sahne rahm butter kaese honig quark joghurt jogurt eier eigelb eiweiss cheese milk cream
    fraiche ruehrei spiegelei osterei
  `),
  contains: words(`
    mayonnaise majonaese hollandaise milchschokolade vollmilchschokolade
  `).concat(phrases('weisse schokolade|white chocolate')),
  allowed: phrases(
    'kokosmilch|kokosnussmilch|sojamilch|sojadrink|mandelmilch|hafermilch|reismilch|nussmilch|haselnussmilch|' +
      'cashewmilch|dinkelmilch|erbsenmilch|hanfmilch|lupinenmilch|pflanzenmilch|milchsaeure|kokossahne|sojasahne|' +
      'hafersahne|reissahne|mandelsahne|cashewsahne|pflanzensahne|erdnussbutter|mandelbutter|cashewbutter|nussbutter|' +
      'sheabutter|kakaobutter|kokosbutter|sonnenblumenbutter|butternut|butternuss|butterkuerbis|butterbohne|' +
      'butterbohnen|butterkopfsalat|buttersalat|butterfly|honigmelone|honigmelonen|eierschwamm|eierschwaemme|' +
      'eierschwammerl|eierfrucht|eierfruechte|eierpflanze|eierpflanzen|sojajoghurt|kokosjoghurt|haferjoghurt|' +
      'mandeljoghurt|cashewjoghurt|sojaquark|cashewkaese|hefekaese|' +
      'coconut milk|coconut cream|almond milk|soy milk|soya milk|oat milk|rice milk|cashew milk|hazelnut milk|' +
      'plant milk|plant-based milk|nut milk|hemp milk|pea milk|cream of tartar|milk thistle|peanut butter|' +
      'almond butter|cashew butter|nut butter|cocoa butter|shea butter|coconut butter|sunflower butter|seed butter|' +
      'butter bean|butter beans|butter lettuce|butterhead|buttercup|butternut|honeydew|bean curd|soy curd|eggplant|eggplants|' +
      'egg plant|soy yogurt|soy yoghurt|coconut yogurt|coconut yoghurt|oat yogurt|almond yogurt|cashew cheese',
  ),
  markers: words(`
    vegan pflanzlich plant-based plant-based plantbased ersatz alternative alternativ dairy-free milchfrei eifrei
    egg-free eggless
  `),
};
