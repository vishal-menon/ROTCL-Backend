require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    console.log("begun verifying jwt");
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log(req.headers)
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    console.log("verified jwt");
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403); //invalid token
            req.user = decoded.uid;
            next();
        }
    );
}

module.exports = verifyJWT