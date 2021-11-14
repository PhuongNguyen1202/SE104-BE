import express from 'express';
import {  
    deleteAll_ListPostInSavePost,
    deleteManyPostInSavePost,
    deletePostInSavePost, 
    getAllPostInSavePost,  
    saveToPost } 
    from '../controllers/savePost.js';
import { verifyToken } from '../middlewares/verifyToken.js';


const router = express.Router();

router.post('/saved', verifyToken, saveToPost);
router.get('/', verifyToken, getAllPostInSavePost);
router.post('/unsaved', verifyToken, deletePostInSavePost);
router.post('/many_unsaved', verifyToken, deleteManyPostInSavePost);
router.post('/all_unsaved', verifyToken, deleteAll_ListPostInSavePost);

export default router;