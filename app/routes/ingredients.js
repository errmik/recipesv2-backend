import express from 'express'
import { auth as authMiddleware } from '../middleware/auth.js';

const router = express.Router();

import { getAllIngredients, getIngredients, searchIngredients, autocompleteIngredients, getIngredient, createIngredient, updateIngredient, deleteIngredient } from '../controllers/ingredients.js'

//All 'get' actions don't need to be authenticated
//All other actions (the ones that make modifications to the db) need to be authenticated

router.route('/')
    .get(getIngredients)
    .post(authMiddleware, createIngredient);

router.route('/all')
    .get(getAllIngredients)

router.route('/search')
    .post(searchIngredients);

router.route('/search/autocomplete')
    .post(autocompleteIngredients);

router.route('/:id')
    .get(getIngredient)
    .patch(authMiddleware, updateIngredient)
    .delete(authMiddleware, deleteIngredient);

export { router as ingredientsRouter };