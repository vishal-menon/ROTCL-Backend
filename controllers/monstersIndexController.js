const supabase = require('../models/database'); 

const getMonsterByName = async (req, res) => {
    const name = req.params?.name;
    
    if (!name) return res.status(400).json({message: 'name not specified.'});

    let response = await supabase.from('monster_index').select('*').ilike('name', name);

    if (response.error) return res.status(response.status).json({message: response.error});

    if (!response.data.length) return res.status(response.status).json({message: 'Monster not found.'}); 

    return res.status(response.status).json(response.data)
}

const getStarters = async (req, res) => {
    const response = await supabase.from('monster_index').select('*').eq('is_starter', true);

    if (response.error) return res.status(response.status).json({message: response.error});

    return res.status(response.status).json(response.data)
}

module.exports = {
    getMonsterByName,
    getStarters
}