"use strict";
import User from "../models/User.js";
import Role from "../models/Role.js";

export const isUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userID).populate('role')
    if(!user.role){
      return res.status(400).json({success: false, message: "Role is null"})
    }
    if(user.role.role_name === "user" || user.role.role_name==="admin"){
      return next()
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
