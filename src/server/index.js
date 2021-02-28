const express = require('express');
const routers = require('../routes');
const path = require('path');
const { ErrorMiddleware, NotFoundMiddleware } = require('../middlewares');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const methodOverride = require('method-override');
const db = require("../models");

class Server {

    constructor(){
        console.log("Initializing server...");

        // init app
        this._app = express();

        // ************ Template Engine ************
        this._app.set('view engine', 'ejs');
        this._app.set('views', path.join(__dirname, '../views')); // Define la ubicación de la carpeta de las Vistas

        // init app level middlewares
        this.initMiddlewares();

        // init routers
        this._routers = routers;
        this.initRouters();

        // Setting error middleware
        this._app.use(ErrorMiddleware);

    }

    start = () => {
        this._app.listen(process.env.PORT, () => {
            console.log(`${process.env.APP_NAME} APP running on port ${process.env.PORT}`);
        })
    }

    initMiddlewares = () => {
        console.log("Initializing middlewares...");
        this._app.use(express.urlencoded({ extended: false }));
        this._app.use(express.json());
        const options = {
            dotfiles: 'ignore',
            etag: false,
            extensions: ['htm', 'html'],
            index: false,
            maxAge: '1d',
            redirect: false,
            setHeaders: function (res, path, stat) {
              res.set('x-timestamp', Date.now());
            }
          };
        this._app.use(express.static(path.join(__dirname, '../public'), options));
        
        //  middlewares cookie-parser y express-session
        this._app.use(cookieParser());
        this._app.use(session({ secret: "my secret!!$"}));
        this._app.use(methodOverride('_method'));

        // configuramos middleware para iniciar sesion con data en cookies
        this._app.use(async (req, res, next) => {
            if(req.session.user == undefined && req.cookies.userEmail != undefined){
                const user = await db.User.findOne({ where: { email: req.cookies.userEmail }, include: [{
                    model: db.Role,
                    as: 'roles',
                    through: { attributes: [] }  
                }] });
                if (user) {
                    // guardamos la data del usuario en session
                    const userData = { ...user.dataValues };
                    userData.roles = userData.roles.map(role => ({...role.dataValues}));
                    delete userData.password;
                    req.session.user = userData;
                }
            }
            next();
        });
        
        // configuramos middleware para pasarle la data del usuario a las vistas
        this._app.use(function(req, res, next) {
            res.locals.userLogueado = req.session.user != undefined;
            req.session.user != undefined ? res.locals.user = req.session.user : null;
            next();
        });
    }

    initRouters = () => {
        console.log("Initializing routes...");
        this._app.use("/", this._routers.mainRoutes);
        this._app.use("/users", this._routers.userRoutes);
        this._app.use("/products", this._routers.productRoutes);
        this._app.use("/order", this._routers.orderRoutes);
    }
}

module.exports = Server;