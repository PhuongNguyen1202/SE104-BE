const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RoleSchema = new Schema({
    role_name: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    list_permission: [{
        permission: {
            type: mongoose.Schema.Types.ObjectId,
            ref: role_permissons
        }
    }]
})

module.exports = mongoose.model('roles', RoleSchema)