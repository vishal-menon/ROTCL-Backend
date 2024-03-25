const { NVarChar } = require('mssql');
const Database = require('../models/database');

const db = new Database();

const getMonster = async (name) => {
    const request = await db.connect();

    const result = await request
        .input('name', NVarChar(255), name)
        .query('SELECT * FROM MonstersIndex WHERE name=@name');

    return result.recordset[0];    
}

const addMonster = async (data) => {
    const request = await db.connect();
    
    request.input('name', NVarChar(255), data.name);
    request.input('rarity', NVarChar(255), data.rarity);
    request.input('baseHp', int, data.baseHp);
    request.input('baseAtk', int, data.baseAtk);
    request.input('baseSpd', int, data.baseSpd);
    request.input('baseDef', int, data.baseDef);
    request.input('baseStamina', int, data.baseStamina);

    request.query('INSERT INTO MonstersIndex VALUES (@name, @rarity, @baseHp, @baseAtk, @baseSpd, @baseDef, @baseStamina)');
}

module.exports = {
    getMonster,
    addMonster
}
