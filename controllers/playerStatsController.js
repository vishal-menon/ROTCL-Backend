const playerStats = require('../services/playerStats');

const getStats = async (req, res) => {
    try {
        const data = await playerStats.getPlayerStats(req.body.uid);
        if (data) res.status(200).json(data);
        else res.sendStatus(404);
    } catch (err) { 
        res.status(500).json({"message" : err.message});
    }
}

const updateStats = async (req, res) => {
    const data = req.body; 
    try {
        const player = await playerStats.getPlayerStats(data.uid);
        if (player) {
            await player.updatePlayerStats(data)
            res.status(200).json({"message": "Player Stats Successfully updated"});
        }
        else res.sendStatus(404);
    } catch (err) {
        res.status(500).json({"message" : err.message});
    }
}

module.exports = {
    getStats,
    updateStats
}

