import { StatusCodes } from 'http-status-codes'
import moment from 'moment'
import { Ingredient } from "../models/ingredient.js"
import { NotFoundError } from '../errors/customError.js'
import langConstants from '../constants/lang.js'
import searchConstants from '../constants/search.js'

//async try catch managed by package 'express-async-errors' in all controllers
//all custom errors (explicitely thrown) or runtime errors are handled by the error management middleware

const getAllIngredients = async (req, res) => {

    var { lang } = req.query

    if (!lang)
        lang = langConstants.DEFAULT_LANG

    const ingredients = await Ingredient.find({}).select(`name.${lang}`).exec();

    res.status(StatusCodes.OK).json(ingredients)
}

const getIngredients = async (req, res) => {

    var { lang, page, limit } = req.query

    if (!lang)
        lang = langConstants.DEFAULT_LANG

    if (!page)
        page = 1

    if (!limit)
        limit = searchConstants.DEFAULT_LIMIT

    let totalHits = await Ingredient.countDocuments({});
    const ingredients = await Ingredient.find({}).skip((page - 1) * limit).limit(limit).select(`name.${lang}`).exec();

    res.status(StatusCodes.OK).json({
        totalHits,
        page,
        from: (page - 1) * limit,
        to: (page - 1) * limit + ingredients.length - 1,
        ingredients
    })
}

const searchIngredients = async (req, res) => {

    var { text, lang } = req.body

    let pipeline = [
        {
            $search: {
                index: "ingredients_search_index",
                text: {
                    query: text,
                    path: `name.${lang}`,
                    // fuzzy: {
                    //     maxEdits: 2
                    // }
                }
            }
        },
        { $limit: 12 },
        { $project: { _id: 1, [`name.${lang}`]: 1 } }
    ];

    var results = await Ingredient.aggregate(pipeline).exec();

    res.status(StatusCodes.OK).json(results)
}

const autocompleteIngredients = async (req, res) => {

    var { text, lang } = req.body

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
                }
            }
        },
        { $limit: 12 },
        { $project: { _id: 1, [`name.${lang}`]: 1 } }
        //{ $project: { _id: 1, [`name.${lang}`]: 1 } }
    ];

    var results = await Ingredient.aggregate(pipeline).exec();

    res.status(StatusCodes.OK).json({ results })
}

const getIngredient = async (req, res) => {

    const ingredientId = req.params.id;

    const ingredient = await Ingredient.findById(ingredientId).exec();

    if (!ingredient)
        throw new NotFoundError('Ingredient not found')

    res.status(StatusCodes.OK).json({ ingredient })
}

const createIngredient = async (req, res) => {

    const ingredient = new Ingredient(req.body);
    ingredient.createdDate = moment();

    await ingredient.save();

    res.status(StatusCodes.CREATED).json({ ingredient })
}

const updateIngredient = async (req, res) => {
    const ingredientId = req.params.id;

    const ingredient = await Ingredient.findByIdAndUpdate(ingredientId, req.body, {
        //return the new object (updated one)
        new: true,
        //use the validation rules defined in the model
        runValidators: true
    }).exec();

    if (!ingredient)
        throw new NotFoundError('Ingredient not found')

    res.status(StatusCodes.OK).json({ ingredient })
}

const deleteIngredient = async (req, res) => {
    const ingredientId = req.params.id;

    const ingredient = await Ingredient.findByIdAndDelete(ingredientId).exec();

    if (!ingredient)
        throw new NotFoundError('Ingredient not found')

    res.status(StatusCodes.OK).json({ ingredient })
}

export { getAllIngredients, getIngredients, searchIngredients, autocompleteIngredients, getIngredient, createIngredient, updateIngredient, deleteIngredient }