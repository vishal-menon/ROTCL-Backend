const data = {
    players : require('../models/players.json'),
    setPlayers : (data) => {this.players = data}
};

const getAllPlayers = (req, res) => {
   res.json(data.players);
}

const createPlayer = (req, res) => {
    const newPlayer = {
        uid : req.body.uid,
        pwdHash : req.body.pwd,
        email : req.body.email,
        exp : 0
    }

    if (!newPlayer.uid) return res.status(400).json(
        {'message' : 'UID is required.'}
    )
}

module.exports = {
    getAllPlayers,
    createPlayer
}