import express from 'express';
import { 
    likeAPost, 
    unlikePost 
} from '../controllers/reactions.js';

import { verifyToken } from '../middlewares/verifyToken.js';
import {isUser} from '../middlewares/isUser.js';

const router = express.Router();

router.post('/liked/:id_post',[verifyToken, isUser],likeAPost );
router.post('/unliked/:id_post',[verifyToken, isUser], unlikePost);

export default router;