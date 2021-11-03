import express from 'express';
import { likeAPost, unlikePost } from '../controllers/reactions.js';


const router = express.Router();

router.post('/liked/:id_post',likeAPost );
router.post('/unliked/:id_post', unlikePost);

export default router;