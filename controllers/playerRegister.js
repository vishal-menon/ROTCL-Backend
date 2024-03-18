const config = require('../configs/database');
const Database = require('../models/player');
const bcrypt = require('bcrypt')
const db = new Database(config)

const createPlayer = async (req, res) => {
    const {uid, pwd, email} = req.body
    
    if (!uid || !pwd) return res.status(400).json(
        {'message' : 'UID and Password are required.'}
    )

    const isDuplicate = await db.read(uid)

    if(isDuplicate) return res.sendStatus(409);
    
    try{
        const hashedPwd = await bcrypt.hash(newPlayer.pwdHash, 10)
        const newPlayer = {
            uid : uid,
            pwdHash : hashedPwd,
            email : email,
            exp : 0
        }
        const data = await db.create(newPlayer)
        res.status(201).json({'success' : `New user ${user} created.`});
    } catch(err) {
        res.status(500).json({'message' : err.message});
    }
}

module.exports = createPlayer