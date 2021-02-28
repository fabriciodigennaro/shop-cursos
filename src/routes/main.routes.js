const express = require('express');
const router = express.Router();
const { MainController, UserController, ProductController } = require("../controllers");
const mainController = new MainController();
const userController = new UserController();
const productController = new ProductController();
const multer = require('multer');
const path = require('path');
let { check, validationResult, body } = require('express-validator');
let fs = require('fs'); 
const bcrypt = require('bcrypt');
const { AuthMiddleware, GuestMiddleware } = require('../middlewares');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/tmp/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname)) ;
    }
});

let upload = multer({ storage: storage});

router.get("/", mainController.index );

router.get("/register", GuestMiddleware, userController.register );

router.get("/login", GuestMiddleware, userController.login );

router.get('/search', productController.search);

router.post("/register", upload.any(), [
    check('name')
        .custom((value) => {
            let regex = /^[a-zA-Z ]+$/;
            return regex.test(value);
        })
        .withMessage('El nombre contiene caracteres invalidos')
        .isLength({ min: 2 })
        .withMessage('Este campo debe estar completo')
        .isLength({ max: 100 })
        .withMessage("Este campo no puede superar los 100 caracteres"),
    check('lastname')
        .custom((value) => {
            let regex = /^[a-zA-Z ]+$/;
            return regex.test(value);
        })
        .withMessage('El apellido solo debe contener letras')
        .isLength({ min: 1 })
        .withMessage("Este campo no debe estar vacío")
        .isLength({ max: 100 })
        .withMessage("Este campo no puede superar los 100 caracteres"),
    check('email')
        .isEmail()
        .withMessage('Debe introducir un email valido')
        .isLength({ max: 100 })
        .withMessage("Este campo no puede superar los 100 caracteres"),
    check('password')
        .isLength({min: 4})
        .withMessage('minimo 4 caracteres')
        .isLength({ max: 200 })
        .withMessage("Este campo no puede superar los 100 caracteres"),
    check('repeatPassword')
        .isLength({min: 4})
        .withMessage('minimo 4 caracteres'),
    body('repeatPassword')
        .custom((value, {req}) => value == req.body.password )
        .withMessage('Las contraseñas no coinciden'),
], userController.create );

router.post("/login", userController.authenticate );

router.get("/logout", AuthMiddleware, userController.logout)

module.exports = router;   