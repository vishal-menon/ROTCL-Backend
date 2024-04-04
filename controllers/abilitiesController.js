const Abilities = require('../services/abilities')

// get ability details
const getAbility = async (req, res) => {
    const response = await Abilities.getAbility(req.params?.name);

    if (response ) {
        res.status(200).json(response)
    } else {
        res.sendStatus(404);
    }
}

const getSubAbilitiesBasedOnAbility = async(req, res) => {
    const response = await Abilities.getSubAbilitiesBasedOnAbility(req.params?.name)

    if (response) {
        res.status(200).json(response)
    } else {
        res.sendStatus(404);
    }
}

// get abilites for a pet
const getPetAbilities = async (req, res) => {
    const response = await Abilities.getAbilitiesBasedOnPet(req.params?.mid);

    if (response ) {
        res.status(200).json(response)
    } else {
        res.sendStatus(404);
    }
}

// adding an ability to Abilities Table
const addAbility = async (req, res) => {
    try {
        await Abilites.addAbility(req.body);
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({'message': error.message});
    }
}

// assigning an ability to a pet
const addPetAbility = async (req, res) => {
    try {
        await Abilites.addPetAbility(req.body);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({'message': error.message});
    }
}

module.exports = {
    getAbility,
    getPetAbilities,
    getSubAbilitiesBasedOnAbility,
    addAbility,
    addPetAbility
}