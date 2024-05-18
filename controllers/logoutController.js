const supabase = require('../models/database');

const handleLogout = async (req, res) => {
    const cookies = req.cookies;

    if(!cookies?.jwt) return res.sendStatus(204);
    
    const refreshToken = cookies.jwt;

    let response = await supabase.from('player_refresh_tokens').select('*').eq('jwt', refreshToken);

    if (response.error) return res.status(response.status).json({message: response.error});

    if (!response.data.length) {
        res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure : true});
        res.sendStatus(204);
    }

    response = await supabase.from(player_refresh_tokens).delete().eq('token', refreshToken);

    if (response.error) return res.status(response.status).json({message: response.error});

    res.clearCookie('jwt', {httpOnly : true, sameSite: 'None', secure : true});
    res.sendStatus(204);
}

module.exports = {handleLogout};