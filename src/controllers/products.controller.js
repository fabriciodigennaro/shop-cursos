const db = require('../models');
const { validationResult } = require('express-validator'); 
const { Op } = require("sequelize");

class ProductsController {

	constructor(){
		
	}
	

	/**
     * Lists - Show all products
     * @param {*} req 
     * @param {*} res 
	 * @param {*} next
     */
	list = async (req, res, next) => {
		try {
			const products = await db.Course.findAll({ include: [{
				model: db.CourseImage,
				as: 'images',
			},
			{
				model: db.Mentor,
				as: 'mentor',
			}
		] });
			res.status(200).render("products", { products: products});
		} catch (err) {
			let error = new Error("Error al buscar todos los cursos");
			error.status = 500;
			error.developer_message = err.message;
			next(error);
			return;
		}
	}

	/**
     *  Show one product
     * @param {*} req 
     * @param {*} res 
	 * @param {*} next
     */
	show = async (req, res, next) => {
		try {
			const product = await db.Course.findByPk(req.params.productId, { include: [{
				model: db.CourseImage,
				as: 'images',
			},
			{
				model: db.Category,
				as: 'categories',
			},
			{
				model: db.Mentor,
				as: 'mentor',
			}
		] 
			});
			res.status(200).render("product-detail", { product: product });	
		} catch (err) {
			let error = new Error("Error al buscar el curso seleccionado");
			error.status = 500;
			error.developer_message = err.message;
			next(error);
			return;
		}
	}

	/**
     *  search products
     * @param {*} req 
     * @param {*} res 
	 * @param {*} next
     */
	search = async (req, res, next) => {
		try {
			const products = await db.Course.findAll({ include: [	{
				model: db.CourseImage,
				as: 'images',
			},
			{
				model: db.Mentor,
				as: 'mentor',
			}
		], where: {
			[Op.or]: [
				{name: { [Op.like]: `%${req.query.keyword}%`}},
				{description: { [Op.like]: `%${req.query.keyword}%`}}
			]
		}});
			res.status(200).render("products", { products: products, search: req.query.keyword});
		} catch (err) {
			let error = new Error("Error al buscar todos los cursos");
			error.status = 500;
			error.developer_message = err.message;
			next(error);
			return;
		}
	}


	/**
     *  product create form
     * @param {*} req 
     * @param {*} res 
	 * @param {*} next
     */
	create = async (req, res, next) => {
		try {
			const categories = await db.Category.findAll();
			const mentors = await db.Mentor.findAll();
			res.render("product-create-form", { categories, mentors});
		} catch (err) {
			console.log(err);
			let error = new Error("Error al cargar el formulario");
			error.status = 500;
			error.developer_message = err.message;
			next(error);
			return;
		}

	}
	
	/**
     *  Create -  Method to store
     * @param {*} req 
     * @param {*} res 
	 * @param {*} next
     */
	
	store = async (req, res, next) => {

		const transaction = await db.sequelize.transaction();
		try {
			const errors = [...validationResult(req).errors];
            if(errors.length){
                let error = new Error("Error de validación");
                error.status = 400;
                error.errors = errors;
                throw error;
			}
			
			let course = {
				name: req.body.name,
				duration: req.body.duration,
				mentor_id: req.body.mentor, 
				price: Number(req.body.price),
				discount: Number(req.body.discount),
				description: req.body.description,		
			};
			// TODO modificar vista para poder subir varias imageners y borrarlas
			if(req.files.length){
				course.images = req.files.map((file, index) => ({ filename: file.filename, order: index + 1}))
			}

			const newCourse = await db.Course.create(course, { transaction, include: [{
				model: db.CourseImage,
				as: 'images'
			}]});

			// TODO guardar varias categorias
			await newCourse.setCategories(req.body.category, { transaction });

			await transaction.commit();

			res.redirect("/products/" + newCourse.id);
		} catch (error) {
			console.log(error);
			await transaction.rollback();
			const categories = await db.Category.findAll();
			const mentors = await db.Mentor.findAll();

			return res.render("product-create-form", {
				errors: error.errors,
                message: error.message,
				data: req.body,
				categories, mentors
			});
		}	
	}
	
	/**
     * edit a course
     * @param {*} req 
     * @param {*} res 
     */
	edit = async (req, res) => {
		try { 
			const product = await db.Course.findByPk(req.params.productId, { include: [
				{
					model: db.Mentor,
					as: "mentor",
				},
				{
					model: db.Category,
					as: "categories",
					through: { attributes: []}
				},
				{
					model: db.CourseImage,
					as: "images"
				}
			]});
			const mentors = await db.Mentor.findAll();
			const categories = await db.Category.findAll();

			return res.render("product-edit-form", {product, mentors, categories});
		
		} catch (err) {
            console.log(err);
            return res.render("/products", {
                errors: err.errors,
                message: err.message,
                value: req.body,
            });
        }	
	}
	
	/**
     * update a course
     * @param {*} req 
     * @param {*} res 
     */
	update = async (req, res) => {
		const transaction = await db.sequelize.transaction();
		try { 
			const errors = [...validationResult(req).errors];
           
            if(errors.length){
                let error = new Error("Error de validación");
                error.status = 400;
                error.errors = errors;
                throw error;
			}

			await db.Course.update({
				name: req.body.name,
				duration: req.body.duration,
				mentor_id: req.body.mentor,
				price: Number(req.body.price),
				discount: Number(req.body.discount),
				description: req.body.description,
			}, {
				where: {
					id: req.params.productId
				}, transaction
			});

			const course = await db.Course.findByPk(req.params.productId);
			await course.setCategories(req.body.category, {transaction});

			await transaction.commit();
			return res.redirect("/products/" + req.params.productId);

        } catch (err) {
			console.log(err);
			await transaction.rollback();
			const product = await db.Course.findByPk(req.params.productId, { include: [
				{
					model: db.Mentor,
					as: "mentor",
				},
				{
					model: db.Category,
					as: "categories",
					through: { attributes: []}
				},
				{
					model: db.CourseImage,
					as: "images"
				}
			]});
			const mentors = await db.Mentor.findAll();
			const categories = await db.Category.findAll();
            return res.render("product-edit-form", {
                errors: err.errors,
                message: err.message,
				data: req.body,
				product: { id: req.params.productId},
				mentors, categories, product
            });
        }

	}

	/**
     * Delete a course
     * @param {*} req 
     * @param {*} res 
     */
    destroy = async (req, res, next) => {
        try { 
			const deleteCourse = await db.Course.destroy({
				where: {
					id: req.params.productId
				}
			})

			return res.redirect("/products");
        } catch (err) {
			console.log(err);
			err.view = "error";
			next(err);
        }
    }
};

module.exports = ProductsController;