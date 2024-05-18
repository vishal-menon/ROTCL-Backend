const supabase = require('../models/database');

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

    if (!mid || !rarity) return res.status(400).json({message: 'mid or rarity missing.'});
    
    let response = await supabase.from('abilities').select('*').eq('rarity', rarity);    
     
    if (response.error) return res.status(response.status).json({message: response.error})
    
    let abilities = response.data;

    const slots = AbilitySlotMap[rarity];

    let selectAbilities = [];
    let currIdx;
    let currAbility;

    while (selectAbilities.length !== slots) {
        currIdx = Math.floor(Math.random() * abilities.length); 
        currAbility = abilities[currIdx];
        selectAbilities.push({'mid': mid, 'name': currAbility.name});
        abilities = abilities.filter(ability => ability.name !== currAbility.name);
    }
    
    response = await supabase.from('pet_abilities').insert(selectAbilities);
    
    if (response.error) res.status(response.status).json({message: response.error});
    
    res.status(response.status).json({message: response.statusText});
}

module.exports = { assignRandomAbility };