const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { ProductController } = require('../controllers');
const productController = new ProductController();
const { AdminMiddleware } = require("../middlewares");
const { check } = require('express-validator');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/img/products');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname)) ;
    }
});

let upload = multer({ storage: storage });

router.get('/', productController.list); 

router.get('/:productId(\\d+)/', productController.show); 

router.get('/create', AdminMiddleware, productController.create); 

router.post('/create', AdminMiddleware, upload.any(),[
    check('name')
        .isLength({ min: 5 })
        .withMessage('Mínimo 5 caracteres')
        .isLength({ max: 100 })
        .withMessage('Máximo 100 caracteres'),
    check('duration')
        .isInt({ min: 1, max: 999 })
        .withMessage('ingrese un valor numérico entre 1 y 999'),
    check('price')
        .isFloat({min:1,max:1000000})
        .withMessage('ingrese un valor numérico entre 1 y 100000'),
    check('discount')
        .isInt({ min: 0, max: 100 })
        .withMessage('ingrese un valor numérico entre 0 y 100'),
    check('description')
        .isLength({ min: 5 })
        .withMessage('Mínimo 5 caracteres')
        .isLength({ max: 5000 })
        .withMessage('Máximo 5000 caracteres')    
], productController.store); 

router.get('/:productId(\\d+)/edit', AdminMiddleware, productController.edit); 

router.put('/:productId', AdminMiddleware, upload.any(), [
    check('name')
        .isLength({ min: 5 })
        .withMessage('Mínimo 5 caracteres')
        .isLength({ max: 100 })
        .withMessage('Máximo 100 caracteres'),
    check('duration')
        .isInt({ min: 1, max: 999 })
        .withMessage('ingrese un valor numérico entre 1 y 999'),
    check('price')
        .isFloat({min:1,max:1000000})
        .withMessage('ingrese un valor numérico entre 1 y 100000'),
    check('discount')
        .isInt({ min: 0, max: 100 })
        .withMessage('ingrese un valor numérico entre 0 y 100'),
    check('description')
        .isLength({ min: 5 })
        .withMessage('Mínimo 5 caracteres')
        .isLength({ max: 5000 })
        .withMessage('Máximo 5000 caracteres')    
], productController.update); 


router.delete('/:productId', AdminMiddleware, productController.destroy); 

module.exports = router;