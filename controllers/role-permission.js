'use strict';
import RolePermission from "../models/role-permission.js";

export const addPermission = async(req, res) => {
    try {
        const role = req.body.role;
        const permission = req.body.permission
        if(!role || !permission)
            return res.status(200).json({status: 0, message: "Invalid information: Role and permission not null"})
        const newRolePermission = new RolePermission({
            role: role,
            permission: permission
        })
        await newRolePermission.save();
        res.status(200).json({status: 1, message: "Success"})
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

export const updatePermission = async(req, res) => {
    try {
        const id_permission = req.params.id_permission;
        if (!req.body.role && !req.body.permission)
            return res.status(200).json({status: 0, message: "Info Update not null"})
        const rolePermission = await RolePermission.findById(id_permission);
        if (rolePermission !== null)
        {
            const dataUpdate = req.body;
            await RolePermission.findByIdAndUpdate(id_permission, dataUpdate, { useFindAndModify: true});
            res.status(200).json({status: 1, message: "Success"})
        }
        else res.status(200).json({status: 0, message: "Permission not exist"})
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

export const deletePermissionById = async(req, res) => {
    try {
        const id_permission = req.params.id_permission;
        const rolePermission = await RolePermission.findById(id_permission)
        if(!rolePermission)
            return res.status(200).json({status: 0, message: "Role Permission not exist"})
        await RolePermission.findByIdAndDelete(id_permission, {useFindAndModify: true})
        res.status(200).json({status: 1, message: "Succsess"})
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

export const deleteManyPermission = async(req, res) => {
    try {
        const listPermission = req.body.permission;
        if(listPermission.length === 0)
            return res.status(200).json({status: 0, message: "Invalid Information: list permission not null"})
        await RolePermission.deleteMany({_id: {
            $in: listPermission
        }}, {useFindAndModify: true})
        res.status(200).json({status: 1, message: "Success"})
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

export const deleteAllPermissionInRole = async(req, res) => {
    try {
        const role = req.params.role_name
        if (!role) return res.status(200).json({status: 0, message: "role not null"})

        await RolePermission.deleteMany({role: role}, {useFindAndModify: true})
        res.status(200).json({status: 1, message: "Success"})
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

export const deleteAll = async(req, res) => {
    try {
        await RolePermission.deleteMany({}, {useFindAndModify: true})
        res.status(200).json({status: 1, message: "Success"})
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}