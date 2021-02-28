const fs = require('fs');
const bcrypt = require('bcrypt'); 
const { validationResult } = require('express-validator'); 
const db = require("../models");
const { AuthService } = require("../services");
const { User } = require('../models/index-models');

class UserController  { 

    constructor(){
        this._authService = new AuthService();
    }

    /**
     * Lists all users
     * @param {*} req 
     * @param {*} res 
     * @param {*} next
     */
    index = async (req, res, next) => {
        try {
			const users = await db.User.findAll({ include: [{
                model: db.Role,
                as: 'roles',
                through: { attributes: [] }  
            }] });
			res.status(200).send({ users: users });
		} catch (err) {
			let error = new Error("Error al buscar los usuarios");
			error.status = 500;
			error.developer_message = err.message;
			next(error);
			return;
		}
    }


    /**
     * Returns Register view
     * @param {*} req 
     * @param {*} res 
     */
    register = (req, res) => {
        res.render("register");
    }


    /**
     * Creates a new user
     * @param {*} req 
     * @param {*} res 
     */
    create = async (req, res) => {
        const transaction = await db.sequelize.transaction();
        
        try {
            const errors = [...validationResult(req).errors];
            await this._authService.validateRegisteredUser(req.body.email) ? null : errors.push({value: req.body.email, param: "email", msg: "Email ya registrado"});

            if(errors.length){
                let error = new Error("Error de validación");
                error.status = 400;
                error.errors = errors;
                throw error;
            }
            
            let user = {
                name: req.body.name,
                lastname: req.body.lastname,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10),
                // avatar: req.files[0]?.filename || null, // sintax error in nodemon
                avatar: req.files.length ? req.files[0].filename : null
            };

            /**
             * Creamos el usuario en la base de datos
             */
            const newUser = await db.User.create(user, { transaction });
            
            // Asignación de rol de usuario común
            const roleUser = await db.Role.findOrCreate({ where: { name: "user"}, defaults: { name: "user" }, transaction});
            await newUser.setRoles(roleUser[0].id, { transaction }); // guarda roles para el usuario creado
            
            await newUser.reload( { transaction, include: [{
                model: db.Role,
                as: 'roles',
                through: { attributes: [] }  
            }] });
            
            if (newUser instanceof db.User){
                const userData = { ...newUser.dataValues };
                userData.roles = userData.roles.map(role => ({...role.dataValues}));
                delete userData.password;

                req.session.user = userData;
                
                await transaction.commit();

                return res.redirect("/users/profile");   
            } else {
                throw new Error("Error al intentar crear el nuevo usuario");
            }

        } catch (error) {
            await transaction.rollback();
            
            return res.render("register", {
                errors: error.errors,
                message: error.message,
                data: req.body,
            });
        }
    }

    /**
     * Returns Login view
     * @param {*} req 
     * @param {*} res 
     */
    login = (req, res) => {
        res.render("login")
    }

    /**
     * authenticate login
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    authenticate = async (req, res, next) => {
        try {
            const user =  await this._authService.login(req.body);
            if (user) {
                // guardamos la data del usuario en session
                const userData = { ...user.dataValues };
                userData.roles = userData.roles.map(role => ({...role.dataValues}));
                delete userData.password;
                req.session.user = userData;
    
                // si el user clickeó "recordame" guardamos una cookie
                if (req.body.recordame != undefined) {
                    res.cookie("userEmail", userData.email, {
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                    });
                }
    
                res.redirect("/users/profile");
                
            } else {
                res.render("login", {
                    email: req.body.email,
                    errors: errors.errors,
                });
            }

        } catch (err) {
            let error = new Error(err.message || "Error al intentar procesar el login");
			error.view = "login"
			next(error);
			return;
        }

    }

    /**
     * Returns Profile view
     * @param {*} req 
     * @param {*} res 
     * @param {*} next
     */
    profile = async (req, res, next) => {
        try {
            if(req.session.user){
                let user = await db.User.findByPk(req.session.user.id);
                res.render("profile", {userData: user})
            } else {
                res.redirect("login");
            }
            
        } catch (err) {
            let error = new Error("Error al procesar la petición");
			error.status = 500;
			error.developer_message = err.message;
			next(error);
			return;
        }
    }

    /**
     * user edit form
     * @param {*} req 
     * @param {*} res 
     * @param {*} next
     */
    edit = async (req, res, next) => {

        try {
            if (req.session.user.id != req.params.userId) {
                const error =  new Error("Acceso denegado");
                error.status = 403;
                throw error;
            }
            let user = await db.User.findByPk(req.params.userId);
            res.render("user-edit-form", {userData: user})
        } catch (err) {
            let error = new Error(err.message || "Error al procesar la petición");
			error.status = err.status || 500;
            error.developer_message = err.message;
            error.view = 'error';
			next(error);
			return;
        }
    }

    /**
     * update user modified
     * @param {*} req 
     * @param {*} res 
     * @param {*} next
     */
    update = async (req, res, next) => {
        
        const transaction = await db.sequelize.transaction();  
        try {
            const errors = [...validationResult(req).errors];
            if (req.body.email != req.session.user.email) {
                await this._authService.validateRegisteredUser(req.body.email) ? null : errors.push({value: req.body.email, param: "email", msg: "Email ya registrado"});
            }

            if(errors.length){
                let error = new Error("Error de validación");
                error.status = 400;
                error.errors = errors;
                throw error;
            }

            let user = {
                name: req.body.name,
                lastname: req.body.lastname,
                email: req.body.email,
            };
            req.files.length ? user.avatar = req.files[0].filename : null;

            await db.User.update(user, { where: { id: req.params.userId}, transaction})

            const updatedUser = await db.User.findByPk(req.params.userId, { include: [{
                model: db.Role,
                as: "roles",
                through: { attributes: [] }
            }], transaction});

            const userData = { ...updatedUser.dataValues };
            userData.roles = userData.roles.map(role => ({...role.dataValues}));
            delete userData.password;

            req.session.user = userData;

            await transaction.commit();

            res.redirect("/users/profile");
        } catch (error) {
            await transaction.rollback();
            return res.render("user-edit-form", {
                errors: error.errors,
                message: error.message,
                data: req.body,
            });
        }
    }

    /**
     * delete a user
     * @param {*} req 
     * @param {*} res
     * @param {*} next
     */
    destroy = async (req, res, next) => {
       try {
        req.session.destroy();
        res.clearCookie('userEmail');
        
        await db.User.destroy({ where: { id: req.params.userId}});

        res.redirect("/")

       } catch (error) {
           next(error);
           return;
       }
    }

    /**
     * Closes user session
     * @param {*} req 
     * @param {*} res 
     */
    logout = (req, res) => {
        req.session.destroy();
        res.clearCookie('userEmail');
        res.redirect('/');
    }
};

module.exports = UserController;
