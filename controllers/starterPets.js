const Pets = require('../services/pets');
const Player = require('../services/player');
const bcrypt = require('bcrypt')

const addStarterPets = async (req, res) => {
    const {uid, selectedPets} = req.body;
    const timestamp = new Date();

    try{
        const player = await Player.readPlayer(uid);
        if (!player) res.sendStatus(404)
        await Player.updatePlayer(uid, {pwdHash: player.pwdHash, email: player.email, hasReceivedStarters : 1});
    } catch (error) {
        res.status(500).json({'message': error.message})
    }

    selectedPets.forEach(async pet => {
        const hash = await bcrypt.hash(uid + pet + timestamp.toString(), 2);
        const petData = {
            'mid' : hash,
            'uid' : uid,
            'name' : pet,
            'altName' : pet,
            'modifHp' : 1,
            'modifAtk' : 1,
            'modifSpd' : 1,
            'modifDef' : 1,
            'exp' : 0,
            'inParty': 1
        }
        try {
            await Pets.addPet(petData)
        } catch (error) {
            console.log(error);
            res.status(500).json({'message': error.message})
        }
        }
    );
    res.sendStatus(201);
}

module.exports = { addStarterPets };