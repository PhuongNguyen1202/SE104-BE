import express from 'express';
import {  
    deletePostInSavePost, 
    getAllPostInSavePost,  
    saveToPost } 
    from '../controllers/savePost.js';


const router = express.Router();

router.post('/saved/:id_user', saveToPost);
router.get('/:id_user', getAllPostInSavePost);
router.post('/unsaved/:id_user', deletePostInSavePost);

export default router;