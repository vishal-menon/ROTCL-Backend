const supabase = require('../models/database');
const bcrypt = require('bcrypt'); 

const getPet = async (req, res) => {   
    const mid = req.params?.mid;
    
    if (!mid) return res.status(400).json({message : 'mid missing'});
    
    const response = await supabase.from('pets').select('*').ilike('mid', mid);
    
    console.log(response.data);

    if (response.error) return res.status(response.status).json({message: response.error});

    if (!response.data.length) return res.status(response.status).json({message: 'Pet not found.'});

    return res.status(response.status).json(response.data);
}

const getPetsbyPlayer = async (req, res) => {   
    const uid = req.params?.uid;
    
    if (!uid) return res.status(400).json({message : 'uid missing'});
    
    const response = await supabase.from('pets').select('*, monster_index(*)').ilike('uid', uid);
    
    if (response.error) return res.status(response.status).json({message: response.error});

    return res.status(response.status).json(response.data);
}

const addPet = async (req, res) => {
    const uid = req.params?.uid;

    const body = req.body;
    
    if (!uid) return res.status(400).json({message : 'uid missing'});
    
    if (!body) return res.status(400).json({message : 'body missing'});
    
    let response = await supabase.from('players').select('uid').ilike('uid', uid);
    
    if (response.error) return res.status(response.status).json({message: response.error});
    
    const timestamp = new Date();

    const hash = await bcrypt.hash(uid + pet + timestamp.toString(), 2);

    const petData = {
        'mid': hash,
        'uid' : uid,
        'name' : response.name,
        'altName' : response.altName,
        'birthdate': timestamp
    }

    response = await supabase.from('pets').insert(petData); 
    
    if (response.error) return res.status(response.status).json({message: response.error});

    return res.status(response.status).json({message: response.statusText});
}

const updatePet = async (req, res) => {
    const mid = req.params?.mid;
    
    const body = req.body;
    
    if (!uid) return res.status(400).json({message : 'uid missing'});
    
    if (!body) return  res.status(400).json({message : 'body missing'});
     
    let response = await supabase.from('pets').select('mid').eq('mid', mid);

    if (response.error) return res.status(response.status).json({message: response.error});

    if (!response.data.length) return res.status(response.status(404).json({message: 'Pet not found.'}));

    response = await supabase.from('pets').update(body).eq('mid', mid);
    
    if (response.error) return res.status(response.status).json({message: response.error});
    
    return res.status(response.status).json({message: response.statusText});
}


module.exports = {
    getPet,
    getPetsbyPlayer,
    addPet,
    updatePet
}