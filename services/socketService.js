const { response } = require('express');
const petsController = require('../controllers/petsController')
const Monster = require('../models/monster.js');


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

    pets.forEach(async pet => {

        let x = await getMonsterByName(pet.name)

        pet = {...pet, ...x}        
    });

    return pets;
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

function changeTurn(newGame)
{
    let all_monsters = newGame.p1_monsters.concat(newGame.p2_monsters)

    let currTurnReached = false
    for(let i = 0; ; i = ((i + 1)%all_monsters.length) )
    {
        if(currTurnReached){
            if(getMonsterByID(all_monsters[i].id, newGame).status !== 'fainted'){
                newGame.turn = getMonsterByID(all_monsters[i].id, newGame).id
                break
            }
        }

        if(all_monsters[i].id === newGame.turn){
            currTurnReached = true;
        }

    }

}

function gameManager(data1, newGame)
{
    

        newGame.p1_monsters.forEach(pet => {
            if(pet.id === parseInt(data1[1])){
                pet.currHp -= parseInt(data1[0])
                if(pet.currHp <= 0){
                    pet.currHp = 0
                    pet.status = 'fainted'
                }
            }
        });

        newGame.p2_monsters.forEach(pet => {
            if(pet.id === parseInt(data1[1])){
                pet.currHp -= parseInt(data1[0])
                if(pet.currHp <= 0){
                    pet.currHp = 0
                    pet.status = 'fainted'
                }
            }
        });

        
        changeTurn(newGame);  
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