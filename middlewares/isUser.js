"use strict";
import User from "../models/User.js";
import Role from "../models/Role.js";

export const isUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userID);
    if (!user) {
      return res.status(400).json({ success: false, message: "User is null" });
    }
    let roleID = user.role.toString()
    console.log(roleID)
    const role = await Role.findById(roleID)
    if(!role){
      return res.status(400).json({success: false, message: "Role is null"})
    }
    if(role.role_name === "user" || role.role_name==="admin"){
      return next()
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
