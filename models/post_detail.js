import mongoose from "mongoose";

const postDetailSchema = mongoose.Schema({
    id_post: {
        type: String
    },
    description: {
        type: String
    },
    directions: [Object],
    count_directions: Number
})

const PostDetail = mongoose.model('post_detail', postDetailSchema);
export default PostDetail;