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
  photo: { type: String },
  calories: { type: Number }, //in kcal
  carbs: { type: Number }, //in grams
  protein: { type: Number }, //in grams
  fat: { type: Number }, //in grams
  cholesterol: { type: Number }, //in milligrams
  sugar: { type: Number }, //in grams
  sodium: { type: Number }, //in milligrams
  fiber: { type: Number }, //in grams
  createdDate: { type: Date, default: Date.now },
});

// calories	Decimal	Energy content in kcal
// carbohydrate	Decimal	Total carbohydrate content in grams
// protein	Decimal	Protein content in grams
// fat	Decimal	Total fat content in grams
// saturated_fat	Decimal	Saturated fat content in grams (where available)
// polyunsaturated_fat	Decimal	Polyunsaturated fat content in grams (where available)
// monounsaturated_fat	Decimal	Monounsaturated fat content in grams (where available)
// cholesterol	Decimal	Cholesterol content in milligrams (where available)
// sodium	Decimal	Sodium content in milligrams (where available)
// potassium	Decimal	Potassium content in milligrams (where available)
// fiber	Decimal	Fiber content in grams (where available)
// sugar	Decimal	Sugar content in grams (where available)
// vitamin_a	Decimal	Vitamin A content in micrograms (where available)
// vitamin_c	Decimal	Vitamin C content in milligrams (where available)
// calcium	Decimal	Calcium content in milligrams (where available)
// iron	Decimal	Iron content in milligrams (where available)
// is_default	Int	(Premier Exclusive) Only included if its the suggested or most commonly chosen option. If included equals 1
// trans_fat	Decimal	Trans fat content in grams (where available)
// added_sugars	Decimal	Added Sugars content in grams (where available)
// vitamin_d	Decimal	Vitamin D content in micrograms (where available)

const Ingredient = mongoose.model("Ingredient", IngredientSchema);

export { Ingredient };
