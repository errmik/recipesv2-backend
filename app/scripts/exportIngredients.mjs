import { writeFile } from 'node:fs/promises';
import { Ingredient } from '../models/ingredient.js';
import { connectDB } from '../db/connect.js';

const exportIngredients = async (filepath) => {

    try {

        var db = await connectDB(process.env.RECIPES_DB_URL);

        const ingredients = await Ingredient.find({}).exec();

        await writeFile(filepath, JSON.stringify(ingredients, null, 4))

        db.disconnect()

    } catch (err) {
        console.log(err);
    }
}


exportIngredients('../../data/ingredients.json')