import { StatusCodes } from "http-status-codes";
import moment from "moment";
import { Ingredient } from "../models/ingredient.js";
import { NotFoundError } from "../errors/customError.js";
import langConstants from "../constants/lang.js";
import searchConstants from "../constants/search.js";
import { Request, Response } from "express";

//async try catch managed by package 'express-async-errors' in all controllers
//all custom errors (explicitely thrown) or runtime errors are handled by the error management middleware

const getAllIngredients = async (req: Request, res: Response) => {
  let { lang } = req.query;

  if (!lang) lang = langConstants.DEFAULT_LANG;

  //return the string fields in the requested language
  const ingredients = await Ingredient.find({})
    .select(`name.${lang} description.${lang} photo`)
    .sort(`name.${lang}`)
    .collation({ locale: lang as string, caseLevel: true })
    .exec();

  res.status(StatusCodes.OK).json(ingredients);
};

const getIngredients = async (req: Request, res: Response) => {
  let { lang } = req.query;

  let page: number = parseInt(req.query.page as string);
  let limit: number = parseInt(req.query.limit as string);

  if (!lang) lang = langConstants.DEFAULT_LANG;
  if (!page) page = 1;
  if (!limit) limit = searchConstants.DEFAULT_LIMIT;

  let totalHits = await Ingredient.countDocuments({});

  let sortName = `name.${lang}`;

  const ingredients = await Ingredient.find({})
    .sort({ [sortName]: 1 })
    .collation({ locale: lang as string, caseLevel: true })
    .skip((page - 1) * limit)
    .limit(limit)
    .select(`name.${lang} description.${lang} photo`)
    .exec();

  res.status(StatusCodes.OK).json({
    totalHits,
    page,
    from: (page - 1) * limit,
    to: (page - 1) * limit + ingredients.length - 1,
    ingredients,
  });
};

const countAllIngredients = async (req: Request, res: Response) => {
  let totalHits = await Ingredient.countDocuments({});
  res.status(StatusCodes.OK).json(totalHits);
};

//UNUSED FOR NOW
//https://www.mongodb.com/docs/atlas/atlas-search/tutorial/partial-match/
const searchIngredients = async (req: Request, res: Response) => {
  let { text, lang } = req.body;

  if (!lang) lang = langConstants.DEFAULT_LANG;

  //split the search query into individual terms, and wildcard-ize them
  // let query = text as string;
  // let splittedQuery = query.split(" ").map((item) => `*${item.trim()}*`);

  // text = "*" + text + "*";

  let pipeline = [
    {
      $search: {
        index: "ingredients_search_index",
        // text: {
        //   query: text,
        //   path: `name.${lang}`,
        //   // fuzzy: {
        //   //     maxEdits: 2
        //   // }
        // },
        wildcard: {
          path: `name.${lang}`,
          query: text,
          //query: `${splittedQuery.join(" ")}`,
          allowAnalyzedField: true,
        },
      },
    },
    { $limit: 12 },
    { $project: { _id: 1, [`name.${lang}`]: 1, photo: 1 } },
  ];

  if (lang != langConstants.DEFAULT_LANG) {
    //Add default language in the projection object
    pipeline[2].$project![`name.${langConstants.DEFAULT_LANG}`] = 1;
  }

  var results = await Ingredient.aggregate(pipeline).exec();

  res.status(StatusCodes.OK).json(results);
};

const autocompleteIngredients = async (req: Request, res: Response) => {
  let { text, lang } = req.body;

  let page: number = parseInt(req.body.page as string);
  let limit: number = parseInt(req.body.limit as string);

  if (!lang) lang = langConstants.DEFAULT_LANG;
  if (!page) page = 1;
  if (!limit) limit = searchConstants.DEFAULT_LIMIT;

  let pipeline = [
    {
      $search: {
        index: "ingredients_search_index",
        autocomplete: {
          query: text,
          path: `name.${lang}`,
          // fuzzy: {
          //     maxEdits: 2
          // }
        },
        count: {
          type: "total",
        },
      },
    },
    // {
    //   $count: "totalCount",
    // },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    {
      $project: {
        meta: "$$SEARCH_META",
        _id: 1,
        photo: 1,
        [`name.${lang}`]: 1,
        [`description.${lang}`]: 1,
      },
    },
  ];

  var results = await Ingredient.aggregate(pipeline).exec();

  res.status(StatusCodes.OK).json(results);
};

const countAutocompleteIngredients = async (req: Request, res: Response) => {
  let { text, lang } = req.body;

  if (!lang) lang = langConstants.DEFAULT_LANG;

  let pipeline = [
    {
      $search: {
        index: "ingredients_search_index",
        autocomplete: {
          query: text,
          path: `name.${lang}`,
          // fuzzy: {
          //     maxEdits: 2
          // }
        },
      },
    },
    {
      $count: "totalCount",
    },
  ];

  var results = await Ingredient.aggregate(pipeline).exec();

  res.status(StatusCodes.OK).json({ results });
};

const getIngredient = async (req: Request, res: Response) => {
  const ingredientId = req.params.id;

  const ingredient = await Ingredient.findById(ingredientId).exec();

  if (!ingredient) throw new NotFoundError("Ingredient not found");

  //console.log(ingredient);

  res.status(StatusCodes.OK).json(ingredient);
};

const createIngredient = async (req: Request, res: Response) => {
  const ingredient = new Ingredient(req.body);
  ingredient.createdDate = moment().toDate();

  await ingredient.save();

  res.status(StatusCodes.CREATED).json({ ingredient });
};

const updateIngredient = async (req: Request, res: Response) => {
  const ingredientId = req.params.id;

  //Partial update of nested paths "name" and "description"
  //Generate a list of updated fields :
  // - all top level fields
  // - name[locale] and description[locale]
  const fields = [];

  for (let [key, value] of Object.entries(req.body)) {
    if (key === "name" || key === "description") {
      for (let [key2, value2] of Object.entries(value as Object)) {
        fields.push([`${key}.${key2}`, value2]);
      }
    } else {
      fields.push([key, value]);
    }
  }

  const update = Object.fromEntries(fields);

  const ingredient = await Ingredient.findOneAndUpdate(
    { _id: ingredientId },
    {
      $set: update,
    },
    {
      //return the new object (updated one)
      new: true,
      //use the validation rules defined in the model
      runValidators: true,
    }
  ).exec();

  if (!ingredient) throw new NotFoundError("Ingredient not found");

  res.status(StatusCodes.OK).json({ ingredient });
};

const deleteIngredient = async (req: Request, res: Response) => {
  const ingredientId = req.params.id;

  const ingredient = await Ingredient.findByIdAndDelete(ingredientId).exec();

  if (!ingredient) throw new NotFoundError("Ingredient not found");

  res.status(StatusCodes.OK).json({ ingredient });
};

export {
  getAllIngredients,
  getIngredients,
  countAllIngredients,
  searchIngredients,
  autocompleteIngredients,
  countAutocompleteIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};
