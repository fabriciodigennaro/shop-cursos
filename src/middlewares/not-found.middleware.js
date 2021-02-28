module.exports = (req, res, next) => {
    let httpError = {
        status: 404,
        message: "Not found"
    };

    res.render('error', { error: httpError});
}