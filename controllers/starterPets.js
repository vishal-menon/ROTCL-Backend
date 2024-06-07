const supabase = require('../models/database');

const addStarterPets = async (req, res) => {
    const {uid, selectedPets} = req.body;
    
    const timestamp = new Date();

    let response = await supabase.from('players').select('uid');

    if (response.error) return res.status(response.status).json({message: response.error});

    if (!response.data.length) res.status(404).json({message: 'Player not Found'});

    response = await supabase.from('players').update({'has_received_starters': true}).eq('uid', uid);

    if (response.error) return res.status(response.status).json({message: response.error});

    selectedPets.forEach(async pet => {
        const petData = {
            'uid' : uid,
            'name' : pet,
            'birth_date': timestamp,
            'alt_name' : pet,
            'in_party': 1
        }
        response = await supabase.from('pets').insert(petData);
        if (response.error) console.log(response.error);
    })
    
    res.status(response.status).json({message: response.statusText});
}

module.exports = { addStarterPets };