import mongoose from 'mongoose';

const rolePermissionSchema = mongoose.Schema({
    role: {
        type: String,
        require: true
    },
    permission: {
        type: String,
        require: true
    }
})

const RolePermission = mongoose.model('role-permission', rolePermissionSchema)
export default RolePermission