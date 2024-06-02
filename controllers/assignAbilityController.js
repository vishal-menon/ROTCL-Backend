const supabase = require('../models/database');

const assignRandomAbility = async (req, res) => {
    
    const rarity = req.params.rarity;
    
    const mid = req.params.mid;

    console.log(mid, rarity);

    if (!mid || !rarity) return res.status(400).json({message: 'mid or rarity missing.'});
    
    let response = await supabase.from('abilities').select('*').eq('rarity', rarity);    
     
    if (response.error) return res.status(response.status).json({message: response.error})
    
    let abilities = response.data;

    const currIdx = Math.floor(Math.random() * abilities.length); 
    
    const currAbility = abilities[currIdx];

    console.log(currAbility);
    
    response = await supabase.from('pet_abilities').insert({'mid': mid, 'name': currAbility.name});
    
    if (response.error) return res.status(response.status).json({message: response.error});
    
    return res.status(response.status).json(currAbility);
}

module.exports = { assignRandomAbility };