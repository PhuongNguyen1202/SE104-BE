import mongoose from "mongoose";
const imgredientsSchema = mongoose.Schema({
    name: String,
    index_name: String
})

const Imgredient = mongoose.model('imgredients', imgredientsSchema);
export default Imgredient;