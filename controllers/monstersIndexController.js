const Monsters = require('../services/monsters');

const getMonsterByName = async (req, res) => {
    const monsters = await Monsters.getMonster(req.params.name);
    if (monsters) {
        res.status(200).json(monsters);
    } else res.sendStatus(404);
}

module.exports = {
    getMonsterByName
}