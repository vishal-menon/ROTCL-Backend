const supabase = require('../models/database');

const getStats = async (req, res) => {   
    const uid = req.params?.uid;
    
    if (!uid) return res.status(400).json({message : 'uid missing'});
    
    const response = await supabase.from('player_stats').select('*').ilike('uid', uid);
    
    if (response.error) return res.status(response.status).json({message: response.error});

    if (!response.data.length) return res.status(response.status).json({message: 'Player not found.'});

    return res.status(response.status).json(response.data[0]);
}

const updateStats = async (req, res) => {
    const uid = req.params?.uid;
    
    const body = req.body;
    
    if (!uid) return res.status(400).json({message : 'uid missing'});
    
    if (!body) return  res.status(400).json({message : 'body missing'});
     
    let response = await supabase.from('player_stats').select('uid').eq('uid', uid);

    if (response.error) return res.status(response.status).json({message: response.error});

    if (!response.data.length) return res.status(response.status(404).json({message: 'Player not found.'}));

    response = await supabase.from('player_stats').update(body).eq('uid', uid);
    
    if (response.error) return res.status(response.status).json({message: response.error});
    
    return res.status(response.status).json({message: response.statusText});
}

module.exports = {
    getStats,
    updateStats
}

