import User from '../models/User.js'

export const isAdmin = async(req, res, next) => {
    try {
        //use verifyToken to check Login
        const user = req.userID;

        //get info user
        const userInfo = await User.findById(user);

        //user isn't admin
        if(userInfo.role != 'ADMIN')
            return res.status(200).json({status: 0, message: "You haven't permission"})

        next()
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}