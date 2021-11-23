import express from 'express';
import { 
    likeAPost, 
    unlikePost 
} from '../controllers/reactions.js';

import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/liked/:id_post',verifyToken,likeAPost );
router.post('/unliked/:id_post',verifyToken, unlikePost);

export default router;