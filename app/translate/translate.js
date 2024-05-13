import { Ingredient } from '../app/models/ingredient.js';
import * as deepl from 'deepl-node';

const DeeplLang = {
    'fr' : 'fr',
    'en' : 'en-gb',
    'es' : 'es',
    'ca' : 'ca',
    'de' : 'de',
    'el' : 'el',
    'it' : 'it',
    'nl' : 'nl',
    'tr' : 'tr',
    'pt' : 'pt-pt',
    'ru' : 'ru',
    'zh' : 'zh',
}

const translate = async (text, srcLang, dstLang) => {

    try {

        const authKey = process.env.DEEPL_AUTH_KEY;
        const translator = new deepl.Translator(authKey);

        const result = await translator.translateText(text, srcLang, DeeplLang[dstLang]);

        var ingredients = await Ingredient.find({}).exec()

        if (result.text) {
            return result.text
        }

        return null

    } catch (err) {
        return null
    }
}

const translateIngredients = async (srcLang, dstLang) => {

    try {

        var ingredients = await Ingredient.find({}).exec()

        for (let i = 0; i < ingredients.length; i++) {

            var ingredient = ingredients[i];

            if (ingredient.name[srcLang] && !ingredient.name[dstLang]) {
                
                const result = await translate(ingredient.name[srcLang], srcLang, dstLang);

                if (result) {

                    ingredient.name[dstLang] = result
                    await ingredient.save()
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
}
