
const db = require('../models');


class OrderController {

    constructor(){
		
	}

    checkout = async (req, res, next) => {
        try {
            let productIds = req.body.productIds.match(/[0-9]+/g);
            const products = await db.Course.findAll({where: { id: productIds }});
console.log(products);
            res.render("checkout", {products});
            
        } catch (error) {
            error.view = 'error';
            next(error);
        }
    }

    pay = async (req, res, next) => {
        try {
            const order = { products: [ 'curso1', 'curso2']}
            res.render('order-detail', {order})
        } catch (error) {
            error.view = 'error';
            next(error);
        }
    }
};

module.exports = OrderController;







