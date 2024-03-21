require('dotenv').config();
const player = require('../models/player');
const tokens = require('../models/tokens');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    const { uid, pwd } = req.body;
    if (!uid || !pwd) return res.status(400).json({'message' : 
    'Username and password are required.'});
    const foundPlayer = await player.readPlayer(uid);
    if (!foundPlayer) return res.sendStatus(401); //Unauthorized

    const match = await bcrypt.compare(pwd, foundPlayer.pwdHash);
    if(match) {
        const accessToken = jwt.sign(
            {"uid" : foundPlayer.uid},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn : '5m'}
        );
        const refreshToken = jwt.sign(
            {"uid": foundPlayer.uid},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '1d'}
        );
        const prevToken = await tokens.searchToken(uid);
        if (prevToken) tokens.updateToken({"uid": uid, "token": refreshToken});
        else tokens.addToken({"uid": uid, "token": refreshToken});
        res.cookie('jwt', refreshToken, {httpOnly: true, sameSite: 'None', secure: true, securmaxAge: 24 * 60 * 60 * 1000});
        res.json({accessToken: accessToken, uid: foundPlayer.uid})
    } else {
        res.sendStatus(401);
    }
}

module.exports = {handleLogin};