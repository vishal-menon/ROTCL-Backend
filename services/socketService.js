const { response } = require('express');
const petsController = require('../controllers/petsController')
const Monster = require('../models/monster.js');

async function getSubAbilitiesBasedOnAbility(abilityName){

    let result
    
    await fetch(`http://localhost:3001/ability/listofsub/${abilityName}`, {
        method: 'GET'
      })
    .then(response => response.json())
    .then(data => {
        result = data
    });

    return result;

}


async function getMonsterByName(name){

    let monsters
    
    await fetch(`http://localhost:3001/monsters/${name}`, {
        method: 'GET'
      })
    .then(response => response.json())
    .then(data => {
        monsters = data
    });

    return monsters;
}

async function getAbilitiesByMID(mid){

    let abilities

    await fetch(`http://localhost:3001/ability/pet/${mid}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        abilities = data
    })

    return abilities
}

async function getPlayerMonsters(uid){

    let pets
    
    await fetch(`http://localhost:3001/pets/${uid}`, {
        method: 'GET'
      })
    .then(response => response.json())
    .then(data => data[0])
    .then(data => {

        pets = data.filter((pet) => {
            return pet.inParty
        });
    });

    let modifiedPets = [];

    for(let pet of pets) {
        let monster = await getMonsterByName(pet.name)
        let abilities = await getAbilitiesByMID(pet.mid)
        let modifiedPet = { ...pet, ...monster, abilities: abilities };
        modifiedPets.push(modifiedPet);
    };

    return modifiedPets;
}

function leaveMatch(pSocket, matchID){
    pSocket.leave(matchID);
}

function isGameFinished(currMatch){

    let p1deathCount = 0
    let p2deathCount = 0

    console.log(currMatch.gameId)

    currMatch.p1_monsters.forEach(pet => {
        if(pet.status === 'fainted')
            p1deathCount += 1
    });

    currMatch.p2_monsters.forEach(pet => {
        if(pet.status === 'fainted')
            p2deathCount += 1
    });

    if(p1deathCount >= 3)
        return 2
    else if(p2deathCount >= 3)
        return 1
    else
        return 0

}

function isSocketInRoom(socketId, io) {

    const socket = io.sockets.sockets.get(socketId);

    if (socket) {
        const rooms = [...socket.rooms];
        console.log(rooms)
        return rooms.length > 1 || (rooms.length === 1 && rooms[0] !== socket.id);
    } else {
        return false; // Socket not found
    }
}

function getMonsterByID(pID, newGame)
{
    let res

    newGame.p1_monsters.forEach(pet => {
        if(pet.id === pID)
        {
            res = pet
        }
    });
    newGame.p2_monsters.forEach(pet => {
        if(pet.id === pID)
        {
            res = pet
        }
    });

    return res
}

function onTurnStatusEffect(newGame){
    let myPet = newGame.p1_monsters.filter(monster => monster.id === newGame.turn).concat(newGame.p2_monsters.filter(monster => monster.id === newGame.turn))[0]

    for (let key in myPet.buffs){
        invokeStatusEffect(myPet , key, myPet.buffs[key])
    }
}

function changeTurn(newGame, mIDTurnOrder)
{
    let all_monsters = mIDTurnOrder

    let currTurnReached = false
    for(let i = 0; ; i = ((i + 1)%all_monsters.length) )
    {
        if(currTurnReached){
            if(getMonsterByID(all_monsters[i].mid, newGame).status !== 'fainted'){
                newGame.turn = getMonsterByID(all_monsters[i].mid, newGame).id
                break
            }
        }

        if(all_monsters[i].mid === newGame.turn){
            currTurnReached = true;
        }

    }

    onTurnStatusEffect(newGame)

}

async function invokeStatusEffect(myPet, statusName, details){

    if(details.turns <= 0)
    {
        delete myPet.buffs[statusName]
        return;
    }

    console.log(statusName + " has been invoked on " + myPet.name)

    myPet.currHp += details.value

    if(myPet.currHp <= 0){
        myPet.currHp = 0
        myPet.status = 'fainted'
    }

    details.turns -= 1;

}

async function applyStatusEffect(subAbility, affectedPet, myPet){

    let abilityVal = 0;
    
    if(subAbility.modifier !== null)
        abilityVal = subAbility.modifier * myPet.currAtk;

    affectedPet.buffs[`'${subAbility.status}'`] = { value: abilityVal, turns: subAbility.turns };

}

async function applyAbility(newGame, subAbility, target){

    let affectedPet = newGame.p1_monsters.filter(monster => monster.id === target).concat(newGame.p2_monsters.filter(monster => monster.id === target))[0]
    let myPet = newGame.p1_monsters.filter(monster => monster.id === newGame.turn).concat(newGame.p2_monsters.filter(monster => monster.id === newGame.turn))[0]

    if(subAbility.status !== null){
        applyStatusEffect(subAbility, affectedPet, myPet);
    }

    if(subAbility.target === 'target' && subAbility.modifier !== null){
        affectedPet.currHp += subAbility.modifier * myPet.currAtk

        if(affectedPet.currHp <= 0){
            affectedPet.currHp = 0
            affectedPet.status = 'fainted'
        }
    }

    console.log(newGame)

}

async function gameManager(nameTarget, newGame, mIDTurnOrder)
{
    // let myPet = newGame.p1_monsters.filter(monster => monster.id === newGame.turn).concat(newGame.p2_monsters.filter(monster => monster.id === newGame.turn))[0]

    // for (let key in myPet.buffs){
    //     invokeStatusEffect(myPet , key, myPet.buffs[key])
    // }
    
    let subAbilities = await getSubAbilitiesBasedOnAbility(nameTarget[0])
    console.log(subAbilities)
    console.log("xxxtentacion")

    subAbilities.forEach((sub) => {
        applyAbility(newGame, sub, nameTarget[1])
    });

    console.log(newGame)

        // newGame.p1_monsters.forEach(pet => {
        //     if(pet.id === parseInt(nameTarget[1])){
        //         pet.currHp -= parseInt(nameTarget[0])
        //         if(pet.currHp <= 0){
        //             pet.currHp = 0
        //             pet.status = 'fainted'
        //         }
        //     }
        // });

        // newGame.p2_monsters.forEach(pet => {
        //     if(pet.id === parseInt(nameTarget[1])){
        //         pet.currHp -= parseInt(nameTarget[0])
        //         if(pet.currHp <= 0){
        //             pet.currHp = 0
        //             pet.status = 'fainted'
        //         }
        //     }
        // });

        
        changeTurn(newGame, mIDTurnOrder);  
}

module.exports = {
    leaveMatch,
    isGameFinished,
    isSocketInRoom,
    getMonsterByID,
    changeTurn,
    gameManager,
    getPlayerMonsters,
   // getTestingMonster
}