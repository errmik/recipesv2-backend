import { StatusCodes } from 'http-status-codes'
import moment from 'moment'
import { Ingredient } from "../models/ingredient.js"
import { NotFoundError } from '../errors/customError.js'

//async try catch managed by package 'express-async-errors' in all controllers
//all custom errors (explicitely thrown) or runtime errors are handled by the error management middleware

const getAllIngredients = async (req, res) => {

    //estimatedDocumentCount will ignore the query object
    let totalHits = await Ingredient.estimatedDocumentCount({});
    const ingredients = await Ingredient.find({}).exec();

    res.status(StatusCodes.OK).json({ ingredients })
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

export { getAllIngredients, getIngredient, createIngredient, updateIngredient, deleteIngredient }