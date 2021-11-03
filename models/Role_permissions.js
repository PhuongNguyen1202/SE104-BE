const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PermissionShema = new Schema({
    permission_name: {
        type: String,
        require: true
    },

    createdAt: {
        type: Date,
        default: Date.now()
    },

    updatedAt: {
        type: Date
    } 
})

module.exports = mongoose.model('role_permissions', PermissionShema)