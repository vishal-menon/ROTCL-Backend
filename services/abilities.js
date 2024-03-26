const { NVarChar, Bit, Int, Decimal } = require('mssql');
const Database = require('../models/database');

const db = new Database();

// add an ability to Abilities table
const addAbility = async (data) => {
    try {
        const request = await db.connect();

        request.input('name', NVarChar(255), data.name);
        request.input('rarity', NVarChar(255), data.rarity);
        request.input('type', NVarChar(255), data.type);
        request.input('aoe', Bit, data.aoe);
        request.input('stamina', Int, data.stamina);
        request.input('effect', NVarChar(255), data.effect);
        request.input('effectDuration', Int, data.effectDuration);
        request.input('modifier', Decimal(3, 2), data.modifier);

        await request.query(
            'INSERT INTO Abilities values (@name, @rarity, @type, @aoe, @stamina, @effect, @effectDuration, @modifier)'
        );
    } catch (err) {
        console.log(err);        
    }
}

// assign an ability to a pet (PetAbilities Table)
const addPetAbility = async (data) => { 
    try {
        const request = await db.connect();

        request.input('mid', NVarChar(255), data.mid);
        request.input('name', NVarChar(255), data.name);

        await request.query(
            'INSERT INTO PetAbilities VALUES (@mid, @name)'
        );
    } catch (err) {
        console.log(err.message);
    }
}

// get an ability based on its name from the Abilities Table
const getAbility = async (name) => {
    try {
        const request = await db.connect();
       
        const response = await request
            .input('name', NVarChar(255), name)
            .query(
                'SELECT * FROM Abilities WHERE name=@name'
            );
    } catch (err) {
        console.log(err.message);
    }
}

// get a Pet's abilities
const getAbilitiesBasedOnPet = async (mid) => {
    try {
        const request = await db.connect();
       
        const response = await request
            .input('mid', NVarChar(255), mid)
            .query(
                'SELECT * FROM PetAbilities INNER JOIN Abilities ON PetAbilities.name = Abilities.name WHERE mid=@mid'
            );
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    addAbility,
    addPetAbility,
    getAbility,
    getAbilitiesBasedOnPet
}