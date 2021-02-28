const fs = require('fs');
const path = require('path');
const db = require('../models');
const { UtilsService } = require("../services");


class MainController {

	constructor() {
		this._utilsService = new UtilsService();
	}

	/**
     * index-home show all products
     * @param {*} req 
     * @param {*} res 
	 * @param {*} next
     */
	index = async (req, res, next) => {
		try {
			const products = await db.Course.findAll({ include: [{
				model: db.CourseImage,
				as: 'images',
			},
			{
				model: db.Mentor,
				as: 'mentor',
			}
		], limit: 5 });
		const inSaleProducts = await db.Course.findAll({ include: [{
			model: db.CourseImage,
			as: 'images',
		},
		{
			model: db.Mentor,
			as: 'mentor',
		}
	], limit: 5, order: [['discount', 'DESC']] });
			res.status(200).render("index", { products, inSaleProducts});
		} catch (err) {
			let error = new Error("Error al cargar los productos en home");
			error.status = 500;
			error.developer_message = err.message;
			next(error);
			return;
		}
	}

};

module.exports = MainController;

