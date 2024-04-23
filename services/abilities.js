const { NVarChar, Bit, Int, Decimal } = require('mssql');
const Database = require('../models/database');

const db = new Database();

// add an ability to Abilities table
const addAbility = async (data) => {
    try {
        const request = await db.connect();

        request.input('name', NVarChar(255), data.name);
        request.input('subAbilityName', NVarChar(255), data.subAbilityName);
        request.input('rarity', NVarChar(255), data.rarity);
        request.input('stamina', Int, data.stamina);

        await request.query(
            'INSERT INTO Abilities values (@name, @subAbilityName, @rarity, @stamina)'
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

//Adding subAbilties
const addSubAbility = async (data) => {
    try {
        const request = await db.connect();

        request.input('name', NVarChar(255), data.name);
        request.input('target', NVarChar(255), data.target);
        request.input('status', NVarChar(255), data.status);
        request.input('turns', Int, data.turns);
        request.input('modifier', Decimal(5,3), data.modifier);
        request.input('modifierStat', NVarChar(255), data.modifierStat);

        await request.query(
            'INSERT INTO SubAbilities values (@name, @target, @status, @turns, @modifier, @modifierStat)'
        );
    } catch (err) {
        console.log(err);        
    }
}

const getSubAbilitiesBasedOnAbility = async (abilityName) => {
    try {
        const request = await db.connect();

        let ability = await getAbility(abilityName)
        ability = ability[0]

        const subAbilities = ability.subAbilityName.split(',')
        const placeholders = subAbilities.map((element) => `'${element}'`).join(',');

        const query = `SELECT * FROM SubAbilities WHERE name IN (${placeholders})`;
       
        const result = await request.query(query);
        return result.recordset

    } catch (err) {
        console.log(err.message);
    }
}

// get an ability based on its name from the Abilities Table
const getAbility = async (name) => {
    try {
        const request = await db.connect();
       
        const result = await request
            .input('name', NVarChar(255), name)
            .query(
                'SELECT * FROM Abilities WHERE name=@name'
            );

        return result.recordset;
    } catch (err) {
        console.log(err.message);
    }
}

const getAbilityOnRarity = async (rarity) => {
    try {
        const request = await db.connect();

        const result = await request
            .input('rarity', NVarChar(255), rarity)
            .query(
                'SELECT * FROM Abilities WHERE rarity=@rarity'
            );
            return result.recordset;
    } catch (error) {
        console.log(error.message);
    }
}

// get a Pet's abilities
const getAbilitiesBasedOnPet = async (mid) => {
    try {
        const request = await db.connect();
       
        const result = await request
            .input('mid', NVarChar(255), mid)
            .query(
                'SELECT p.mid, p.name, a.subAbilityName, a.rarity, a.stamina, a.target FROM PetAbilities p INNER JOIN Abilities a ON p.name = a.name WHERE mid=@mid'
            );
        return result.recordset;
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    addAbility,
    addPetAbility,
    getAbility,
    getAbilitiesBasedOnPet,
    getSubAbilitiesBasedOnAbility,
    addSubAbility,
    getAbilityOnRarity
}