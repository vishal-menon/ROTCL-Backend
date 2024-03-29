const Pets = require('../services/pets');
const Player = require('../services/player')

const getPetsbyPlayer = async (req, res) => {    
    const pets = await Pets.searchPetsByPlayer(req.params.id);
    if (pets) {
        res.status(200).json(pets);
    } else res.sendStatus(404);
}

const addPet = async (req, res) => {
    const data = req.body;
    const player = await Player.readPlayer(data.uid);
    if (player) {
        Pets.addPet(data);
    } else {
        res.status(404).json({"message" : "Player ID invalid"});
    }
}

const updatePet = async (req, res) => {
    const data = req.body;
    const pet = await Pets.searchPet(data.mid);
    if (pet) {
        Pets.updatePet(data)
    } else {
        res.status(404).json({"message" : "Pet not found"});
    }
}


module.exports = {
    getPetsbyPlayer,
    addPet,
    updatePet
}