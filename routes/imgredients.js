import express from "express";

import { liveSearchImgredient } from "../controllers/imgredients.js";

const router = express.Router();

router.get('/live-search', liveSearchImgredient);

export default router;