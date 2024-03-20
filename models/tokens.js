const { NVarChar } = require('mssql');
const Database = require('./database')

const db = new Database()

const addToken = async (data) => {
    const request = await db.connect();
    
    request.input('uid', NVarChar(255), data.uid);
    request.input('token', NVarChar(255), data.token);

    request.query('INSERT INTO PlayersRefreshTokens (uid, token) VALUES (@uid, @token)');
}

const searchToken = async (token) => {
    const request = await db.connect();
    
    const result = await request
        .input('token', NVarChar(255), token)
        .query(
            'SELECT * FROM PlayerRefreshTokens WHERE token=@token'
        );
    
    return result.recordset[0];
}

const deleteToken = async (token) => {
    const request = await db.connect();

    await request
        .input('token', NVarChar(255), token)
        .query(
            'DELETE FROM PlayerRefreshTokens WHERE token=@token'
        );
}

module.exports = {
    addToken,
    searchToken,
    deleteToken
}