'use strict';
import Role from "../models/Role.js";

//Thêm role
//http://localhost:5000/role/add_role
export const addRole = async (req, res) => {

    try {
        console.log("ADD A ROLE");
        const data = req.body;
        if (!data.role_name || !data.description) {
            res.status(200).json({ message: 'Invalid information: role_name, description fields blank are not NULL' })
        }
        else {
            const newRole = new Role({
                role_name: data.role_name,
                description: data.description
            })
            await newRole.save()
            console.log(newRole)
            res.status(200).json({ message: "Success" })

        }
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//Xóa role
//http://localhost:5000/role/delete/:id
export const deleteRoleById = async (req, res) => {
    try {
        let id_role = req.params.id;
        const role = await Role.findById(id_role);
        if (!role)
            return res.status(200).json({ message: "Role is not exist" })
        await Role.findByIdAndDelete(id_role, { useFindAndModify: true })
        res.status(200).json({ message: "Success" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
//update role
//http://localhost:5000/role/update/:id
export const updateRoleById = async (req, res) => {
    try {
        let data = req.body;
        if (!data.role_name || !data.description) {
            res.status(200).json({ message: 'Invalid information: role_name, description fields blank are not NULL' })
        }
        let id_role = req.params.id;
            
                const updateRole = {
                    role_name: data.role_name,
                    description: data.description,
                    updatedAt: Date.now()
                }
                //update
                await Role.findByIdAndUpdate(id_role, updateRole, { useFindAndModify: true });
                res.status(200).json({ message: "Success" })
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    }
