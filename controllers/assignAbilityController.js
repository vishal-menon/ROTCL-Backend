const Abilities = require('../services/abilities');

const AbilitySlotMap = {
    'Common' : 2,
    'Uncommon': 2,
    'Rare': 3,
    'Epic': 3,
    'Legendary': 4,
    'Divine': 4,
}

const assignRandomAbility = async (req, res) => {
    const {mid, rarity} = req.body

    try {
        let abilities = await Abilities.getAbilityOnRarity(rarity);        
        const slots = AbilitySlotMap[rarity];

        let selectAbilities = [];
        let currIdx;
        let currAbility;

        while (selectAbilities.length !== slots) {
            currIdx = Math.floor(Math.random() * abilities.length); 
            currAbility = abilities[currIdx];
            selectAbilities.push(currAbility);
            abilities = abilities.filter(ability => ability.name !== currAbility.name);
        }

        selectAbilities.map(ability => Abilities.addPetAbility({'mid': mid, 'ability': ability.name}))
    } catch (error) {
        res.status(500).json({message : error.message});
    }
}

module.exports = { assignRandomAbility };