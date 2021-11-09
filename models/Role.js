import mongoose from 'mongoose';


const roleSchema = new mongoose.Schema({
    role_name: {
        type: String,
        required: true
    },

    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },

    updatedAt: {
        type: Date,
        default: null
    }
})

const Roles = mongoose.model('Roles', roleSchema);

export default Roles;