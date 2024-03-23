const player = require('../services/player');
const bcrypt = require('bcrypt')

const createPlayer = async (req, res) => {
    const {uid, pwd, email} = req.body
    
    if (!uid || !pwd) return res.status(400).json(
        {'message' : 'UID and Password are required.'}
    )

    const isDuplicate = await player.readPlayer(uid)

    if(isDuplicate) return res.sendStatus(409);
    
    try{
        const hashedPwd = await bcrypt.hash(pwd, 10)
        const newPlayer = {
            uid : uid,
            pwdHash : hashedPwd,
            email : email,
            exp : 0
        }
        const data = await player.addPlayer(newPlayer)
        res.status(201).json({'success' : `New user ${uid} created.`});
    } catch(err) {
        res.status(500).json({'message' : err.message});
    }
}

const getPlayer = async (req, res) => {
    const result = await player.readPlayer(req.body.uid);
    res.json(result)
}

module.exports = {
    createPlayer,
    getPlayer
}