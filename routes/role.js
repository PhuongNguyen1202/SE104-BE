import express from 'express';
import { 
    addRole, 
    deleteRoleById, 
    updateRoleById} 
    from '../controllers/role.js';



const router = express.Router();

router.post('/add_role', addRole);
router.post('/update/:id', updateRoleById);
router.delete('/delete/:id', deleteRoleById);

export default router;