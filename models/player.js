const { NVarChar, Int } = require('mssql')
const Database = require('./database')

const db = new Database()

const addPlayer = async (data) => {
    const request = await db.connect();

    request.input('uid', NVarChar(255), data.uid);
    request.input('pwdHash', NVarChar(255), data.pwdHash);
    request.input('email', NVarChar(255), data.email);
    request.input('exp', Int, data.exp)

    const result = request.query(
        'INSERT INTO Players (uid, pwdHash, email, exp) VALUES (@uid, @pwdHash, @email, @exp)'
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
    request.input('exp', Int, data.exp);

    const result = await request.query(
        'UPDATE Players SET uid=@uid, pwdHash=@pwdHash, email=@email, exp=@exp'
    );

    return result.rowsAffected[0];
}

module.exports = {
    addPlayer,
    readPlayer,
    updatePlayer
}