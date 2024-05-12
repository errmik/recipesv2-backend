import { writeFile, readFile } from 'node:fs/promises';
import { Ingredient } from '../app/models/ingredient.js';
//Database
import { connectDB } from "../app/db/connect.js";

const processIngredients = async () => {

    let ingredients = []

    var data = await dataFromFile('./data/ingredients_fr.json')

    for (let ingredient in data) {

        ingredients.push({
            id: data[ingredient].id,
            alcoholic: false,
            name: {
                fr: capitalizeFirstLetter(data[ingredient].name)
            }
        })

        //console.log(data[ingredient].name);
    }

    await addTranslationFromFile(ingredients, './data/ingredients_eng.json', 'en')
    await addTranslationFromFile(ingredients, './data/ingredients_spa.json', 'es')
    await addTranslationFromFile(ingredients, './data/ingredients_cat.json', 'ca')
    await addTranslationFromFile(ingredients, './data/ingredients_ger.json', 'de')
    await addTranslationFromFile(ingredients, './data/ingredients_gre.json', 'el')
    await addTranslationFromFile(ingredients, './data/ingredients_it.json', 'it')
    await addTranslationFromFile(ingredients, './data/ingredients_nld.json', 'nl')
    await addTranslationFromFile(ingredients, './data/ingredients_tur.json', 'tr')

    let processed = ingredients.map(i => { return { alcoholic: i.alcoholic, name: i.name } })

    await writeFile('./data/ingredients.json', JSON.stringify(processed, null, 4))
}

const dataFromFile = async (filename) => {

    try {
        var file = await readFile(filename, 'utf8')

        return JSON.parse(file)
    } catch (err) {
        console.log(err)
    }
}

//Warning : 'ingredients' array is modified by function
const addTranslationFromFile = async (ingredients, filename, lang) => {

    let data = await dataFromFile(filename)

    for (let ingredient in data) {

        let existing = ingredients.find(o => o.id === data[ingredient].id)

        if (existing && existing.name) {
            existing.name[lang] = capitalizeFirstLetter(data[ingredient].name)
        }
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//processIngredients()

const importIngredients = async () => {

    try {

        await connectDB(process.env.RECIPES_DB_URL);

        var data = await dataFromFile('./data/ingredients_filtered.json')

        for (let ingredient in data) {

            var mongoIngredient = new Ingredient(data[ingredient]);
            await mongoIngredient.save();
        }

    } catch (err) {
        console.log(err);
    }
}

importIngredients()