module.exports = (req, res, next) => {
    req.session.user == undefined ? res.redirect('/login') : null;
    if(req.session.user.roles.some(role => role.name == "admin")){
        return next();
    } else {     
        const error = new Error("Acceso denegado");
        error.status = 403;
        error.view = "error";
        throw error;
    }
};