const tokens = require('../models/tokens');

const handleLogout = (req, res) => {
    const cookies = req.cookies;

    if(!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;

    const player = tokens.searchToken(refreshToken);

    if (!player) {
        res.clearCookie('jwt', {http: true, sameSite: 'None', secure : true});
        return res.sendStatus(204);
    }

    tokens.deleteToken(refreshToken);
    res.clearCookie('jwt', {httpOnly : true, sameSite: 'None', secure : true});
    res.sendStatus(204);
}

module.exports = {handleLogout};