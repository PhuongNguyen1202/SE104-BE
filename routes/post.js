import express from "express";
import { verifyToken } from '../middlewares/verifyToken.js'
import { getIdLogin } from '../middlewares/getIdWhenLogin.js'
import { isAdmin } from "../middlewares/isAdmin.js";

import {
    addPost,
    getAllPost,
    getPostById,
    getPostByIdUser,
    updatePost,
    deletePostById,
    randomPost,
    searchPost,
    deleteManyPost,
    deleteAllPostByIdUser,
    managesPost
} from '../controllers/post.js';

const router = express.Router();

router.post('/create', verifyToken, addPost);
router.get('/random', randomPost);
router.get('/search', getIdLogin, searchPost);
router.get('/post_management', verifyToken, managesPost);
router.post('/update/:id', verifyToken, updatePost);
router.delete('/delete-many', verifyToken, deleteManyPost)
router.delete('/delete-all', verifyToken, deleteAllPostByIdUser)
router.delete('/delete/:id', verifyToken, deletePostById);
router.get('/user/:id_user', getPostByIdUser);
router.get('/:id', getIdLogin, getPostById);
router.get('/', getIdLogin, getAllPost);

export default router;