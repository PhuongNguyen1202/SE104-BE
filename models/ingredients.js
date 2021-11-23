import mongoose from "mongoose";
const ingredientsSchema = mongoose.Schema({
    name: String,
    index_name: String
})

const Ingredient = mongoose.model('ingredients', ingredientsSchema);
export default Ingredient;