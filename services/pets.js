const { NVarChar, Decimal, Int, Bit } = require('mssql');
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
    request.input('inParty', Bit, data.inParty)
    request.input('isTrained', Bit, 0)

    request.query('INSERT INTO Pets VALUES (@mid, @uid, @name, @altName, @modifHp, @modifAtk, @modifSpd, @modifDef, @exp, getdate(), @inParty, @isTrained)');
}

const searchPetsByPlayer = async (uid) => {
    const request = await db.connect();
    
    const result = await request
        .input('uid', NVarChar(255), uid)
        .query(
            'SELECT * FROM Pets INNER JOIN MonstersIndex ON Pets.name=MonstersIndex.name WHERE uid=@uid'
        );
    
    return result.recordsets[0];
}

const searchPet = async (mid) => {
    const request = await db.connect();
    
    const result = await request
        .input('mid', NVarChar(255), mid)
        .query(
            'SELECT * FROM Pets WHERE mid=@mid'
        );
    
    return result.recordset[0];
}

const updatePet = async (data) => {
    const request = await db.connect();

    request.input('mid', NVarChar(255), data.mid);
    request.input('name', NVarChar(255), data.name);
    request.input('altName', NVarChar(255), data.altName);
    request.input('modifHp', Decimal(3,2), data.modifHp);
    request.input('modifAtk', Decimal(3,2), data.modifAtk);
    request.input('modifSpd', Decimal(3,2), data.modifSpd);
    request.input('modifDef', Decimal(3,2), data.modifDef);
    request.input('exp', Int(), data.exp);
    request.input('inParty', Bit, data.inParty)

    request.query('UPDATE Pets SET altname=@altname, modifHp=@modifHp, modifAtk=@modifAtk, modifSpd=@modifSpd, modifDef=@modifDef, exp=@exp, inParty=@inParty WHERE mid=@mid')
}


module.exports = {
    addPet,
    searchPetsByPlayer,
    searchPet,
    updatePet,
}
