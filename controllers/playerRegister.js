const supabase = require('../models/database');
const bcrypt = require('bcrypt')

const createPlayer = async (req, res) => {
    const {uid, pwd, email} = req.body
    
    if (!uid || !pwd) return res.status(400).json(
        {'message' : 'UID and Password are required.'}
    )

    let response = await supabase.from('players').select('uid').ilike('uid', uid);

    if (response.error) return res.status(response.status).json({message: response.error});

    if (response.data.length) return res.status(409).json({message: 'uid already exists.'});

    try{
        const hashedPwd = await bcrypt.hash(pwd, 10)
        
        const newPlayer = {
            uid : uid,
            pwdHash : hashedPwd,
            email : email,
            join_date: new Date(),
            has_received_starters: false
        }

        const newPlayerStats = {
            uid : uid,
            exp : 0,
            wins : 0,
            losses : 0 
        } 

        response = await supabase.from('players').insert(newPlayer);

        if (response.error) return res.status(response.status).json({message: response.error});

        response = await supabase.from('player_stats').insert(newPlayerStats);

        if (response.error) return res.status(response.status).json({message: response.error});
        
        res.status(201).json({'success' : `New user ${uid} created.`});

    } catch(err) {
        res.status(500).json({'message' : err.message});
    }
}

module.exports = { createPlayer }