require('dotenv').config()
const jwt = require('jsonwebtoken')
const supabase = require('../models/database');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(401);
    
    const refreshToken = cookies.jwt;

    let {data ,error, status, statusText} = await supabase.from('player_refresh_tokens').select('players(uid, has_received_starters))').eq('token', refreshToken);

    if (error) return res.status(status).json({message: statusText});
    
    if (!data.length) return res.sendStatus(403); //Forbidden

    const playerDetails = data[0].players;

    //evaluate jwt
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || playerDetails.uid !== decoded.uid) return res.sendStatus(403);
            const accessToken = jwt.sign(
                {"uid" : decoded.uid},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '10s'}
            );
            res.json({accessToken: accessToken, uid: playerDetails.uid, hasReceivedStarters: playerDetails.has_received_starters});
        }
    );
}

module.exports = {handleRefreshToken}