import mongoose from "mongoose";
const ingredientsSchema = mongoose.Schema({
    name: String,
    index_name: String
})

const Ingredient = mongoose.model('imgredients', ingredientsSchema);
export default Ingredient;