const { NVarChar, Int } = require('mssql')
const Database = require('../models/database')

const db = new Database()

const addPlayer = async (data) => {
    const request = await db.connect();

    request.input('uid', NVarChar(255), data.uid);
    request.input('pwdHash', NVarChar(255), data.pwdHash);
    request.input('email', NVarChar(255), data.email);

    const result = request.query(
        'INSERT INTO Players (uid, pwdHash, email, exp) VALUES (@uid, @pwdHash, @emails)'
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

    const result = await request.query(
        'UPDATE Players SET uid=@uid, pwdHash=@pwdHash, email=@email'
    );

    return result.rowsAffected[0];
}

module.exports = {
    addPlayer,
    readPlayer,
    updatePlayer
}