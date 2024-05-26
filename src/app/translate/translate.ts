import { Ingredient } from "../models/ingredient.js";
import * as deepl from "deepl-node";

const DeeplLang = {
  fr: "fr",
  en: "en-gb",
  es: "es",
  ca: "ca",
  de: "de",
  el: "el",
  it: "it",
  nl: "nl",
  tr: "tr",
  pt: "pt-pt",
  ru: "ru",
  zh: "zh",
};

const translate = async (
  text: string | null | undefined,
  srcLang: string,
  dstLang: string
) => {
  try {
    if (!text) return null;

    const authKey = process.env.DEEPL_AUTH_KEY as string;
    const translator = new deepl.Translator(authKey);

    const result = await translator.translateText(
      text,
      srcLang as deepl.SourceLanguageCode,
      DeeplLang[dstLang as keyof typeof DeeplLang] as deepl.TargetLanguageCode
    );

    var ingredients = await Ingredient.find({}).exec();

    if (result.text) {
      return result.text;
    }

    return null;
  } catch (err) {
    return null;
  }
};

const translateIngredients = async (srcLang: string, dstLang: string) => {
  try {
    var ingredients = await Ingredient.find({}).exec();

    for (let i = 0; i < ingredients.length; i++) {
      var ingredient = ingredients[i];

      if (
        ingredient.name &&
        ingredient.name[srcLang as keyof typeof ingredient.name] &&
        !ingredient.name[dstLang as keyof typeof ingredient.name]
      ) {
        const result = await translate(
          ingredient.name[srcLang as keyof typeof ingredient.name],
          srcLang,
          dstLang
        );

        if (result) {
          ingredient.name[dstLang as keyof typeof ingredient.name] = result;
          await ingredient.save();
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};
