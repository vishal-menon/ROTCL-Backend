const { NVarChar, Int, Bit } = require('mssql')
const Database = require('../models/database')

const db = new Database()

const addPlayer = async (data) => {
    const request = await db.connect();

    request.input('uid', NVarChar(255), data.uid);
    request.input('pwdHash', NVarChar(255), data.pwdHash);
    request.input('email', NVarChar(255), data.email);

    const result = request.query(
        'INSERT INTO Players (uid, pwdHash, email) VALUES (@uid, @pwdHash, @emails)'
    );
}

const readPlayer = async (uid) => {
    const request = await db.connect();

    const result = await request
        .input('uid', NVarChar(255), uid)
        .query(
            'SELECT * FROM Players WHERE uid=@uid'
        );
    
    return result.recordset[0];
}

const updatePlayer = async (uid, data) => {
    const request = await db.connect()

    request.input('uid', NVarChar(255), uid);
    request.input('pwdHash', NVarChar(255), data.pwdHash);
    request.input('email', NVarChar(255), data.email); 
    request.input('hasReceivedStarters', Bit, data.hasReceivedStarters);

    const result = await request.query(
        'UPDATE Players SET pwdHash=@pwdHash, email=@email, hasReceivedStarters=@hasReceivedStarters WHERE uid=@uid'
    );

    return result.rowsAffected[0];
}

module.exports = {
    addPlayer,
    readPlayer,
    updatePlayer
}