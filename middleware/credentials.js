const credentials = (req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
}

module.exports = credentials;
