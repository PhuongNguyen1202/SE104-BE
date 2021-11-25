'use strict';
import Role from "../models/Role.js";
export const checkRoleExist = (req, res, next) => {
    if (req.body.role) {
            if (!Role.includes(req.body.roles)) {
                return res.status(400).json({ success: false,
                    message: `Failed. Role ${req.body.role} does not exist.`,
                });
            }
        }
    next();
};