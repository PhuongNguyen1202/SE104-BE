import express from 'express';
import { 
    addRole, 
    deleteRoleById, 
    updateRoleById} 
    from '../controllers/role.js';
import {isAdmin} from '../middlewares/isAdmin.js'
import {verifyToken} from '../middlewares/verifyToken.js'

const router = express.Router();

router.post('/add_role', [verifyToken, isAdmin],addRole);
router.post('/update/:id',[verifyToken, isAdmin],updateRoleById);
router.delete('/delete/:id', [verifyToken, isAdmin],deleteRoleById);

export default router;