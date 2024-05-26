import mongoose, { Schema as Schema, model } from "mongoose";

const IngredientSchema = new Schema({
  alcoholic: { type: Boolean, default: false },
  name: {
    fr: { type: String },
    en: { type: String },
    es: { type: String },
    ca: { type: String },
    de: { type: String },
    el: { type: String },
    it: { type: String },
    nl: { type: String },
    tr: { type: String },
    pt: { type: String },
    ru: { type: String },
    zh: { type: String },
  },
  description: {
    fr: { type: String },
    en: { type: String },
    es: { type: String },
    ca: { type: String },
    de: { type: String },
    el: { type: String },
    it: { type: String },
    nl: { type: String },
    tr: { type: String },
    pt: { type: String },
    ru: { type: String },
    zh: { type: String },
  },
  createdDate: { type: Date, default: Date.now },
});

const Ingredient = mongoose.model("Ingredient", IngredientSchema);

export { Ingredient };
