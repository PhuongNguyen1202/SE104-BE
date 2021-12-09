'use strict';
import mongoose from 'mongoose';
import User from './User.js'

const savePostSchema = new mongoose.Schema(
    {
        id_user: {
          type: String
        },
        list_post: [
            String
        ]
    }
)
const savePost = mongoose.model('savePost', savePostSchema);

export default savePost;