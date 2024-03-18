const config = require('../configs/database');
const Database = require('../models/player');
const bcrypt = require('bcrypt');

const db = new Database(config);

const handleLogin = async (req, res) => {
    const { uid, pwd } = req.body;
    if (!uid || !pwd) return res.status(400).json({'message' : 
    'Username and password are required.'});
    const foundPlayer = await db.read(uid);
    if (!foundPlayer) return res.sendStatus(401); //Unauthorized
    
    const match = await bcrypt.compare(pwd. foundPlayer.pwdHash);
    if(match) {
        res.json({'success': `Player ${uid} is logged in`})
    } else {
        res.sendStatus(401);
    }
}

module.exports = {handleLogin};