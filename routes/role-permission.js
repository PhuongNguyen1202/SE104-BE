import express from 'express';

import { addPermission,
        updatePermission,
        deletePermissionById,
        deleteManyPermission,
        deleteAllPermissionInRole,
        deleteAll
 } from '../controllers/role-permission.js';

const router = express.Router();

router.post('/create', addPermission);
router.post('/update/:id_permission', updatePermission)
router.delete('/delete/:id_permission', deletePermissionById)
router.delete('/delete-all', deleteAll)
router.delete('/delete-many', deleteManyPermission)
router.delete('/delete-all-by-role/:role_name', deleteAllPermissionInRole)

export default router;