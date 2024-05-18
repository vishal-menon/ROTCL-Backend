const supabase = require('../models/database');

// get ability details
const getAbility = async (req, res) => {
    if (!req.params?.name) return res.send(400).json({message: 'name not specified'});
    
    const response = await supabase.from('abilities').select('*').ilike('name', req.params.name);

    if (response.error) return res.status(response.status).json({message: response.error});

    if (!response.data.length) return res.sendStatus(404); 

    return res.json(response.data);
}

const getSubAbilitiesBasedOnAbility = async(req, res) => {
    if (!req.params?.name) return res.send(400).json({message: 'name not specified'});
    
    const {data, error, status} = await supabase.from('ability_sub_mapping').select('sub_abilities(*)').ilike('ability', req.params.name);
    
    if (error) return res.status(status).json({message: error})

    return res.status(status).json(data)
}

// get abilites for a pet
const getPetAbilities = async (req, res) => {
    if (!req.params?.mid) res.send(400).json({message: 'mid not specified'});

    const {data, error, status} = await supabase.from('pet_abilities').select('*').eq('mid', req.params.mid);

    if (error) res.status(status).json({message: error}); 

    res.status(status).json(data);
}

// adding an ability to Abilities Table
const addAbility = async (req, res) => {
    const body = req.body;

    if (!body) return res.send(400).json({message: 'body empty'});
    
    const {data, error, status} = await supabase.from('abilties').insert({name: body.name, rarity: body.rarity, stamina: body.stamina, target: body.target});

    if (error) res.status(status).json({message: error});

    res.status(status).json(data);
}

// assigning an ability to a pet
const addPetAbility = async (req, res) => {
    const body = req.body;

    if (!body) return res.send(400).json({message: 'body empty'});

    const {data, error, status} = await supabase.from('pet_abilities').insert({mid: body.mid, name: body.name});

    if (error) res.status(status).json({message: error});

    res.status(status).json(data);
}

module.exports = {
    getAbility,
    getSubAbilitiesBasedOnAbility,
    getPetAbilities,
    addAbility,
    addPetAbility
}