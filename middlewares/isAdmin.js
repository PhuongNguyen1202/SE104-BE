import User from '../models/User.js'

export const isAdmin = async(req, res, next) => {
    try {
        //use verifyToken to check Login
        const user = req.userID;

        //get info user
        const userInfo = await User.findById(user).populate('role');
        //console.log("userinfo: ",userInfo)

        //user isn't admin
        if(!userInfo || userInfo.role.role_name != 'admin')
            return res.status(200).json({status: 0, message: "You haven't permission"})

        next()
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}