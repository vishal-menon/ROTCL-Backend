const { Int, NVarChar, query } = require("mssql");
const Database = require('../models/database');

const db = new Database();

const getPlayerStats = async (uid) => {
    const request = await db.connect();
    console.log(uid);
    const result = await request
        .input('uid', NVarChar(255), uid)
        .query('SELECT * FROM PlayerStats WHERE uid=@uid');

    return result.recordset[0];
}

const addPlayerStats = async (data) => {
    const request = await db.connect();

    request.input('uid', NVarChar(255), data.uid);
    request.input('exp', Int, data.exp);
    request.input('wins', Int, data.wins);
    request.input('losses', Int, data.losses);

    request.query(
        'INSERT INTO PlayerStats VALUES (@uid, @exp, @wins, @losses)'
    );
}

const updatePlayerStats = async (data) => {
    const request = await db.connect();

    request.input('uid', NVarChar(255), data.uid);
    request.input('exp', Int, data.exp);
    request.input('wins', Int, data.wins);
    request.input('losses', Int, data.losses);

    request.query(
        'UPDATE PlayerStats SET uid=@uid, exp=@exp, wins=@wins, losses=@losses WHERE uid=@uid'
    );
}

module.exports = {
    getPlayerStats,
    addPlayerStats,
    updatePlayerStats
}