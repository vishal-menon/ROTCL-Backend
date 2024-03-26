const { NVarChar, Bit } = require('mssql');
const Database = require('../models/database');

const db = new Database();

const getMonster = async (name) => {    
    try{
        const request = await db.connect();
        const result = await request
            .input('name', NVarChar(255), name)
            .query('SELECT * FROM MonstersIndex WHERE name=@name');

        return result.recordset[0]; 
    } catch (err) {
        console.log(err.message);
    }   
}

const getStarterMonsters = async () => {
    try {
        const request = await db.connect();
        const result = await request
            .input('true', Bit, 1)
            .query(
                'SELECT * FROM MonstersIndex where isStarter=@true'
            );
    
        return result.recordset;
    } catch (err) {
        console.log(err.message);
    }
}

const addMonster = async (data) => {
    try {
        const request = await db.connect();
            
        request.input('name', NVarChar(255), data.name);
        request.input('rarity', NVarChar(255), data.rarity);
        request.input('baseHp', int, data.baseHp);
        request.input('baseAtk', int, data.baseAtk);
        request.input('baseSpd', int, data.baseSpd);
        request.input('baseDef', int, data.baseDef);
        request.input('baseStamina', int, data.baseStamina);
        request.input('imgPath', NVarChar(255), data.imgPath);

        request.query(
            'INSERT INTO MonstersIndex VALUES (@name, @rarity, @baseHp, @baseAtk, @baseSpd, @baseDef, @baseStamina, @imgPath)'
        );
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    getMonster,
    getStarterMonsters,
    addMonster
}
