const supabase = require('../models/database');

const assignRandomAbility = async (req, res) => {
    
    const rarity = req.params.rarity;
    
    const mid = req.params.mid;
 
    const {curr_abilities, slots} = req.body;

    if (!mid || !rarity) return res.status(400).json({message: 'mid or rarity missing.'});
    
    let response = await supabase.from('abilities').select('*').eq('rarity', rarity);    
     
    if (response.error) return res.status(response.status).json({message: response.error})
    
    let abilities = response.data;

    abilities = abilities.filter(ability => !(curr_abilities.includes(ability.name)));
    
    const currIdx = Math.floor(Math.random() * abilities.length); 
    
    const currAbility = abilities[currIdx];

    var abilityCount = 0;
    
    curr_abilities.forEach(ability => {
        if (ability != null) abilityCount+=1;
    })

    if (abilityCount + 1 == slots) await supabase.from('pets').update({'is_trained': true}).eq('mid', mid);

    response = await supabase.from('pet_abilities').insert({'mid': mid, 'name': currAbility.name});
    
    if (response.error) return res.status(response.status).json({message: response.error});
    
    return res.status(response.status).json(currAbility);
}

module.exports = { assignRandomAbility };