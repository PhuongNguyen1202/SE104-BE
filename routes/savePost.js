import express from 'express';
import {  
    deleteAll_ListPostInSavePost,
    deleteManyPostInSavePost,
    deletePostInSavePost, 
    getAllPostInSavePost,  
    saveToPost } 
    from '../controllers/savePost.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import {isUser} from '../middlewares/isUser.js';

const router = express.Router();

router.post('/saved', [verifyToken, isUser], saveToPost);
router.get('/', [verifyToken, isUser], getAllPostInSavePost);
router.post('/unsaved', [verifyToken, isUser], deletePostInSavePost);
router.post('/many_unsaved', [verifyToken, isUser], deleteManyPostInSavePost);
router.delete('/all_unsaved', [verifyToken, isUser], deleteAll_ListPostInSavePost);

export default router;