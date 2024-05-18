const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../configs/config.js')
const supabase = require('../models/database.js')

const handleLogin = async (req, res) => {
    const { uid, pwd } = req.body;
    
    if (!uid || !pwd) return res.status(400).json({'message' : 'Username and password are required.'});
    
    let response = await supabase.from('players').select('*').ilike('uid', uid);
    
    if (!response.data.length) return res.sendStatus(401); //Unauthorized

    const foundPlayer = response.data[0];

    const match = await bcrypt.compare(pwd, foundPlayer.pwd_hash);
    
    if(match) {
        const accessToken = jwt.sign(
            {"uid" : foundPlayer.uid},
            config.ACCESS_TOKEN_SECRET,
            {expiresIn : '10s'}
        );
        const refreshToken = jwt.sign(
            {"uid": foundPlayer.uid},
            config.REFRESH_TOKEN_SECRET,
            {expiresIn: '1d'}
        );
        const prevToken = await supabase.from('player_refresh_tokens').select('*').ilike('uid', uid);
        if (prevToken) await supabase.from('player_refresh_tokens').update({'token': refreshToken}).ilike('uid', uid);
        else await supabase.from('player_refresh_token').insert([{'uid': uid, 'token': refreshToken}]);
        res.cookie('jwt', refreshToken, {httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000});
        res.json({accessToken: accessToken, hasReceivedStarters: foundPlayer.has_received_starters, uid: foundPlayer.uid})
    } else {
        res.sendStatus(401);
    }
}

module.exports = {handleLogin};