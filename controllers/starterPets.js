const supabase = require('../models/database');
const bcrypt = require('bcrypt');

const addStarterPets = async (req, res) => {
    const {uid, selectedPets} = req.body;
    
    const timestamp = new Date();

    let response = await supabase.from('players').select('uid');

    if (response.error) return res.status(response.status).json({message: response.error});

    if (!response.data.length) res.status(404).json({message: 'Player not Found'});

    response = await supabase.from('players').update({'has_received_starters': true}).eq('uid', uid);

    if (response.error) return res.status(response.status).json({message: response.error});

    let petsToBeAdded = [];

    selectedPets.forEach(async pet => {
        const hash = await bcrypt.hash(uid + pet + timestamp.toString(), 2);
        const petData = {
            'mid' : hash,
            'uid' : uid,
            'name' : pet,
            'alt_name' : pet,
            'in_party': 1
        }
        petsToBeAdded.push(petData);
    });

    response = await supabase.from('pets').insert(petsToBeAdded);
    
    if (response.error) return res.status(response.status).json({message: response.error});
    
    res.status(response.status).json({message: response.statusText});
}

module.exports = { addStarterPets };