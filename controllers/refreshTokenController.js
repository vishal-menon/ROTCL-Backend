require('dotenv').config()
const jwt = require('jsonwebtoken')
const tokens = require('../models/tokens')

const handleRefreshToken = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const player = tokens.searchToken(refreshToken);
    if (!player) return res.sendStatus(403); //Forbidden
    //evaluate jwt
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || player.uid !== decoded.uid) return res.sendStatus(403);
            const accessToken = jwt.sign(
                {"uid" : decoded.uid},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '5m'}
            );
            res.json({accessToken});
        }
    );
}

module.exports = {handleRefreshToken}