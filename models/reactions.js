'use strict';
import mongoose from 'mongoose';


const likePostSchema = new mongoose.Schema (
    {
        id_post: {
            type: String
        },
        list_user: [
                 String
        ],
    }
)

const likePost = mongoose.model('likePost', likePostSchema);

export default likePost;