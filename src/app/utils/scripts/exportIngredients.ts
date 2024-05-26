import { writeFile } from "node:fs/promises";
import { Ingredient } from "../../models/ingredient.js";
import { connectDB } from "../../db/connect.js";

const exportIngredients = async (filepath: string) => {
  try {
    var db = await connectDB(process.env.RECIPES_DB_URL as string);

    const ingredients = await Ingredient.find({}).exec();

    await writeFile(filepath, JSON.stringify(ingredients, null, 4));

    db.disconnect();
  } catch (err) {
    console.log(err);
  }
};

// Checks for --custom and if it has a value
const filePathIndex = process.argv.indexOf("-f");
let filePath;

if (filePathIndex > -1) {
  // Retrieve the value after --custom
  filePath = process.argv[filePathIndex + 1];
}

console.log("Writing ingredients to file " + filePath);

if (!filePath) process.exit();

//Use it like that :
//node --env-file=.env.development.local dist/utils/scripts/exportIngredients.js -f data/ing.json
exportIngredients(filePath);
