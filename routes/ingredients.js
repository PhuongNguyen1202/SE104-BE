import express from "express";

import { liveSearchIngredient } from "../controllers/ingredients.js";

const router = express.Router();

router.get('/live-search', liveSearchIngredient);

export default router;