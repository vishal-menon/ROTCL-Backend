const { response } = require('express');
const supabase = require('../models/database');
const petsController = require('../controllers/petsController')
const Monster = require('../models/monster.js');
const { getPlayerStats, updatePlayerStats } = require('../controllers/playerStatsController.js')

const baseUrl = process.env.BACKEND_URL;

async function getSubAbilitiesBasedOnAbility(abilityName){

    let result
    
    await fetch(`${baseUrl}/ability/listofsub/${abilityName}`, {
        method: 'GET'
      })
    .then(response => response.json())
    .then(data => {
        result = data
    });

    return result;

}

async function getMonsterByName(name){

    let monsters = await fetch(`${baseUrl}/monsters/${name}`, {
        method: 'GET'
      })
    .then(response => response.json())
    .then(data => {
        //console.log("Monster by name : ")
        //console.log(data)

        return data[0]
    });

    return monsters;
}

async function getAbilitiesByMID(mid){

    let abilities = await fetch(`${baseUrl}/ability/pet/${mid}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })

    return abilities
}

async function getPlayerMonsters(uid){

    let pets
    await fetch(`${baseUrl}/pets/player/${uid}`, {
        method: 'GET'
      })
    .then(response => response.json())
    .then(data => {
        pets = data.filter((pet) => pet.in_party)
    });

    //console.log(pets);

   // //console.log('akrambikram')
    ////console.log(pets)

    let modifiedPets = [];

    for(let pet of pets) {
        let monster = await getMonsterByName(pet.name)
        let abilities = await getAbilitiesByMID(pet.mid)
        let modifiedPet = { ...pet, ...monster, abilities: abilities };
        modifiedPets.push(modifiedPet);
    };

    ////console.log("Modified Pets")
    ////console.log(modifiedPets)

    return modifiedPets;
}

function leaveMatch(pSocket, matchID){
    pSocket.leave(matchID);
}

async function giveRewards2(uid){

  // const playerStats = await getPlayerStats(uid);
   
    let playerStats = await fetch(`${baseUrl}/stats/${uid}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })

   //console.log(playerStats)

   playerStats.exp = parseInt(playerStats.exp) + 10;

    await fetch(`${baseUrl}/stats/${uid}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(playerStats)
    })

   console.log("done rewarding")

}

async function giveRewards(winnerUID, loserUID){

    console.log("started rewarding")
    // const playerStats = await getPlayerStats(uid);
     
      let winnerStats = await fetch(`${baseUrl}/stats/${winnerUID}`, {
          method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
          return data;
      })

      let loserStats = await fetch(`${baseUrl}/stats/${loserUID}`, {
          method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
          return data;
      })
  
     
  
     winnerStats.exp = parseInt(winnerStats.exp) + Math.floor(Math.max((parseInt(loserStats.exp)-parseInt(winnerStats.exp))/3, 20));
     loserStats.exp = parseInt(loserStats.exp) + Math.floor(Math.min((parseInt(winnerStats.exp)-parseInt(loserStats.exp))/3, -10));

     winnerStats.wins = parseInt(winnerStats.wins) + 1;
     loserStats.losses = parseInt(loserStats.losses) + 1;
  
     //console.log(winnerStats)
     //console.log(loserStats)

      await fetch(`${baseUrl}/stats/${winnerUID}`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(winnerStats)
      })

      await fetch(`${baseUrl}/stats/${loserUID}`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(loserStats)
      })
  
     //console.log("done")
     console.log("done rewarding")
  
  }

function isGameFinished(currMatch, duelRequest){

    let p1deathCount = 0
    let p2deathCount = 0

    //console.log(currMatch.gameId)

    currMatch.p1_monsters.forEach(pet => {
        if(pet.status === 'fainted')
            p1deathCount += 1
    });

    currMatch.p2_monsters.forEach(pet => {
        if(pet.status === 'fainted')
            p2deathCount += 1
    });

    if(p1deathCount >= 3)
    {
        return 2
    }
    else if(p2deathCount >= 3)
    {
        return 1
    }
    else
        return 0

}

function isSocketInRoom(socketId, io) {

    const socket = io.sockets.sockets.get(socketId);

    if (socket) {
        const rooms = [...socket.rooms];
        //console.log(rooms)
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

function onTurnStatusEffect(newGame, mIDTurnOrder){
    let myPet = newGame.p1_monsters.filter(monster => monster.id === newGame.turn).concat(newGame.p2_monsters.filter(monster => monster.id === newGame.turn))[0]

    let isStunned = false

    for (let key in myPet.buffs){
        invokeStatusEffect(myPet , key, myPet.buffs[key], isStunned)
    }

    if(isStunned){
        changeTurn(newGame, mIDTurnOrder)
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

    onTurnStatusEffect(newGame, mIDTurnOrder)

}

async function invokeStatusEffect(myPet, statusName, details, isStunned){

    if(details.turns <= 0)
    {
        delete myPet.buffs[statusName]
        return;
    }

    //console.log(statusName + " has been invoked on " + myPet.name)

    if(statusName === 'stun'){
        isStunned = true;
    }

    myPet.currHp += details.value

    if(myPet.currHp <= 0){
        myPet.currHp = 0
        myPet.status = 'fainted'
    }

    details.turns -= 1;

}

async function applyStatusEffect(subAbility, affectedPet, myPet){

    let abilityVal = 0;
    
    if(subAbility.sub_abilities.modifier !== null)
        abilityVal = subAbility.sub_abilities.modifier * myPet.currAtk;

    if(subAbility.sub_abilities.target === 'target')
        affectedPet.buffs[`'${subAbility.sub_abilities.status}'`] = { value: abilityVal, turns: subAbility.sub_abilities.turns };
    else if(subAbility.sub_abilities.target === 'self')
        myPet.buffs[`'${subAbility.sub_abilities.status}'`] = { value: abilityVal, turns: subAbility.sub_abilities.turns };

}

async function applyAbility(newGame, subAbility, target){

    //console.log("applyAbility executed")
    //console.log(JSON.stringify(subAbility) + " - " + target)

    let affectedPet = newGame.p1_monsters.filter(monster => monster.id === target).concat(newGame.p2_monsters.filter(monster => monster.id === target))[0]
    let myPet = newGame.p1_monsters.filter(monster => monster.id === newGame.turn).concat(newGame.p2_monsters.filter(monster => monster.id === newGame.turn))[0]

    //console.log("currHp of affected pet - before")
    //console.log(affectedPet)


    if(subAbility.sub_abilities.status !== null){
        applyStatusEffect(subAbility, affectedPet, myPet);
    }

    if(subAbility.sub_abilities.target === 'target' && subAbility.sub_abilities.modifier !== null){
   
        affectedPet.currHp += subAbility.sub_abilities.modifier * myPet.currAtk

        if(affectedPet.currHp <= 0){
            affectedPet.currHp = 0
            affectedPet.status = 'fainted'
        }
    }
    else if (subAbility.sub_abilities.modifier !== null){
        affectedPet.currHp += subAbility.sub_abilities.modifier * myPet.hp
    }

    //console.log("currHp of affected pet")
    //console.log(affectedPet)

    ////console.log(newGame)

}

function roundUpAllHealth(newGame)
{
    newGame.p1_monsters.forEach(monster => {

        monster.currHp = Math.ceil(monster.currHp)

        if(monster.currHp >= monster.hp){monster.currHp = monster.hp}
        
    });

    newGame.p2_monsters.forEach(monster => {

        monster.currHp = Math.ceil(monster.currHp)

        if(monster.currHp >= monster.hp){monster.currHp = monster.hp}
        
    });
}

async function gameManager(nameTarget, newGame, mIDTurnOrder)
{
    // let myPet = newGame.p1_monsters.filter(monster => monster.id === newGame.turn).concat(newGame.p2_monsters.filter(monster => monster.id === newGame.turn))[0]

    // for (let key in myPet.buffs){
    //     invokeStatusEffect(myPet , key, myPet.buffs[key])
    // }
    
    let subAbilities = await getSubAbilitiesBasedOnAbility(nameTarget[0])
    //console.log(subAbilities)
    //console.log("xxxtentacion")

    subAbilities.forEach((sub) => {
        applyAbility(newGame, sub, nameTarget[1])
    });

    ////console.log(newGame)

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
        roundUpAllHealth(newGame)
}

module.exports = {
    leaveMatch,
    isGameFinished,
    isSocketInRoom,
    getMonsterByID,
    changeTurn,
    gameManager,
    getPlayerMonsters,
    giveRewards
   // getTestingMonster
}