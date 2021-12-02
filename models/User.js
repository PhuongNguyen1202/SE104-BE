import mongoose from 'mongoose'
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
        // required: true
    },

    password: {
        type: String,
        // required: true
    },

    gender: {
        type: String,
    },

    avatar: {
        type: String
    },

    role: {
        type: Schema.Types.ObjectId,
        ref: 'Roles'
        // type: String
    },

    resetLink: {
        type: String,
        default: ''
    }
})
const User = mongoose.model('user', UserShema);

export default User;