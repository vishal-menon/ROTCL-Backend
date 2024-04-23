const Pets = require('../services/pets');
const bcrypt = require('bcrypt')

const addStarterPets = (req, res) => {
    const {uid, selectedPets} = req.body;
    const timestamp = new Date();
    selectedPets.forEach(async pet => {
        const hash = await bcrypt.hash(uid + pet + timestamp.toString(), 2);
        const petData = {
            'mid' : hash,
            'uid' : uid,
            'name' : pet,
            'modifHp' : 1,
            'modifAtk' : 1,
            'modifSpd' : 1,
            'modifDef' : 1,
            'exp' : 0,
            'inParty': 1
        }
        try {
            await Pets.addPet(petData)
            res.sendStatus(201);
        } catch (error) {
            res.status(500).json({'message': error.message})
        }
    });
}

module.exports = { addStarterPets };