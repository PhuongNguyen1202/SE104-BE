const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserShema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    firstname: {
        type: String,
        trim: true,
        required: true
    },

    lastname: {
        type: String,
        trim: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    gender: {
        type: String,
    },

    avatar: {
        type: String
    },

    role: {
        type: Schema.Types.ObjectId,
        ref: 'roles'
    },

    resetLink: {
        type: String,
        default: ''
    }
})

module.exports = mongoose.model('users', UserShema)