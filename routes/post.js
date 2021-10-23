import express from "express";

import {addPost, getAllPost, getPostById, getPostByIdUser, updatePost, deletePostById, randomPost} from '../controllers/post.js';

const router = express.Router();

router.post('/create', addPost);
router.get('/random', randomPost);
router.get('/post_management/:id_user', getPostByIdUser);
router.post('/update/:id', updatePost);
router.delete('/delete/:id', deletePostById);
router.get('/:id', getPostById);
router.get('/', getAllPost);

export default router;