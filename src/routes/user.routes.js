const express = require('express');
const router = express.Router();

const { UserController } = require("../controllers");
const userController = new UserController();
const { AuthMiddleware, GuestMiddleware } = require('../middlewares');
const multer = require('multer');
const path = require('path');
const { check } = require('express-validator');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/tmp/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname)) ;
    }
});

let upload = multer({ storage: storage });

router.get("/profile", AuthMiddleware, userController.profile);

router.get("/:userId/edit", AuthMiddleware, userController.edit); 

router.put("/:userId", upload.any(), [
    check('name')
        .custom((value) => {
            let regex = /^[a-zA-Z ]+$/;
            return regex.test(value);
        })
        .withMessage('El nombre solo debe contener letras')
        .isLength({ min: 1 })
        .withMessage('Campo requerido')
        .isLength({ max: 100 })
        .withMessage('Máximo 100 caracteres'),
    check('lastname')
        .isAlpha()
        .withMessage('El nombre solo debe contener letras')
        .isLength({ min: 1 })
        .withMessage('Campo requerido')
        .isLength({ max: 100 })
        .withMessage('Máximo 100 caracteres'),
    check('email')
        .isEmail()
        .withMessage('El email ingresado no es valido')
        .isLength({ min: 1 })
        .withMessage('Campo requerido')
        .isLength({ max: 100 })
        .withMessage('Máximo 100 caracteres')
], userController.update);

router.delete('/:userId', userController.destroy);

module.exports = router;
