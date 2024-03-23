const { NVarChar, Decimal, Int, DateTime } = require('mssql');
const Database = require('../models/database')

const db = new Database()

const addPet = async (data) => {
    const request = await db.connect();
    
    request.input('mid', NVarChar(255), data.mid);
    request.input('uid', NVarChar(255), data.uid);
    request.input('name', NVarChar(255), data.name);
    request.input('altName', NVarChar(255), data.altName);
    request.input('modifHp', Decimal(3,2), data.modifHp);
    request.input('modifAtk', Decimal(3,2), data.modifAtk);
    request.input('modifSpd', Decimal(3,2), data.modifSpd);
    request.input('modifDef', Decimal(3,2), data.modifDef);
    request.input('exp', Int(), data.exp);
    request.input('birthDate', DateTime(), data.birthDate);

    request.query('INSERT INTO Pets VALUES (@mid, @uid, @name, @altName, @modifHp, @modifAtk, @modifSpd, @exp, @birthDate)');
}


const searchPetsByPlayer = async (uid) => {
    const request = await db.connect();
    
    const result = await request
        .input('uid', NVarChar(255), uid)
        .query(
            'SELECT * FROM Pets WHERE uid=@uid'
        );
    
    return result.recordset[0];
}

const deletePet = async (mid) => {
    const request = await db.connect();

    await request
        .input('mid', NVarChar(255), mid)
        .query(
            'DELETE FROM PlayerRefreshTokens WHERE mid=@mid'
        );
}

// const updateToken = async (data) => {
//     const request = await db.connect();

//     request.input('uid', NVarChar(255), data.uid);
//     request.input('token', NVarChar(255), data.token);

//     const result = await request.query(
//         'UPDATE PlayerRefreshTokens SET token=@token WHERE uid=@uid'
//     );
// }

module.exports = {
    addPet,
    searchPetsByPlayer,
    deletePet
}
