import { createServer } from "http"
import { platform } from "os";
import { Server } from "socket.io"
import { v4 as uuidv4 } from 'uuid';
import { monster } from './monster.js';
import { Game } from './game.js';

const httpserver = createServer()

const monsters_p1 = [
    {
        id : 0,
        name : 'm1',
        hp : 100,
        status : 'alive',
        owner : 'p1',
        ability : [{
            name  : 'Swipe',
            dmg : 10,
            type : 'atk'
        }, 
        {
            name : 'Cut',
            dmg : 15,
            type : 'atk'
        }]
    },
    {
        id : 1,
        name : 'm2',
        hp : 80,
        status : 'alive',
        owner : 'p1',
        ability : [{
            name  : 'Bite',
            dmg : 10,
            type : 'atk'
        }]
    },
    {
        id : 2,
        name : 'm3',
        hp : 150,
        status : 'alive',
        owner : 'p1',
        ability : [{
            name  : 'Heal',
            dmg : 5,
            type : 'spt'
        }]
    }
]

const monsters_p2 = [
    {
        id : 3,
        name : 'm1',
        hp : 9,
        status : 'alive',
        owner : 'p2',
        ability : [{
            name  : 'Swipe',
            dmg : 10,
            type : 'atk'
        }, 
        {
            name : 'Cut',
            dmg : 15,
            type : 'atk'
        }]
    },
    {
        id : 4,
        name : 'm2',
        hp : 10,
        status : 'alive',
        owner : 'p2',
        ability : [{
            name  : 'Bite',
            dmg : 10,
            type : 'atk'
        }]
    },
    {
        id : 5,
        name : 'm3',
        hp : 21,
        status : 'alive',
        owner : 'p2',
        ability : [{
            name  : 'Heal',
            dmg : 5,
            type : 'spt'
        }]
    }
]

const io = new Server(httpserver, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://127.0.0.1:5500","http://localhost:3000"]
    }
})

/*
Game Manager

    State: P1 Pets (Health)
           P2 Pets (Health)
           Turn (Player, and Pet)

    When a player emits an ability -> it affects health, and changes turn.

*/

const activeGames = new Map();

const users = {};

function isSocketInRoom(socketId) {

    const socket = io.sockets.sockets.get(socketId);

    if (socket) {
        const rooms = [...socket.rooms];
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



io.on('connection', socket => {
    const numClients = io.engine.clientsCount;
    console.log(numClients)
    console.log(`User ${socket.id} connected!`)

    socket.on("join server", (username) => {
        //store username -> map it to socket.
        console.log(username)
        users[username] = socket

        const usernameArray = Object.keys(users);

        io.emit("update user", usernameArray);
    });

    socket.on("duel", (duelRequest) => {

        /*
        duelRequest = {
           player : 'playerUsername',
           opponent : 'opponentUsername'
        };
        */

        let playerSocketID = users[duelRequest.player].id;
        let oppSocketID = users[duelRequest.opponent].id;
       
        //Function -> check if other player is not in any room
        
        if(!isSocketInRoom(oppSocketID) && playerSocketID !== oppSocketID){
            //If yes
            io.to(oppSocketID).emit("duelRequest", duelRequest);
        }
        else{
            //If no
            socket.emit("AlertMessage", duelRequest.opponent + " maybe dueling someone else.");
        }

    });
    
    socket.on("duelAccept", (duelRequest) => {

        let playerSocket = users[duelRequest.player];
        let oppSocket = users[duelRequest.opponent];

        const matchID = uuidv4();

        let p1_monsters = monsters_p1.map((m) => {return new monster(m.hp, m.name, m.status, m.ability, m.id, m.owner)})
        let p2_monsters = monsters_p2.map((m) => {return new monster(m.hp, m.name, m.status, m.ability, m.id, m.owner)})

        
        const newGame = new Game(matchID, p1_monsters, p2_monsters, 0);
        activeGames.set(matchID, newGame);

        //Send both players to a new room.
        playerSocket.join(matchID);
        oppSocket.join(matchID);

        //Start Game.
       // console.log(activeGames);
        
        //Init State
        playerSocket.emit("setState", [newGame.p1_monsters, newGame.p2_monsters, newGame.turn])
        oppSocket.emit("setState", [newGame.p2_monsters, newGame.p1_monsters, newGame.turn])

        playerSocket.on("Ability", data1 => {
            
            let currMatch = activeGames.get(matchID);
            gameManager(data1, currMatch)
            console.log(activeGames);

            playerSocket.emit("setState", [currMatch.p1_monsters, currMatch.p2_monsters, currMatch.turn])
            oppSocket.emit("setState", [currMatch.p2_monsters, currMatch.p1_monsters, currMatch.turn])

        }) 

        oppSocket.on("Ability", data1 => {

            let currMatch = activeGames.get(matchID);
            gameManager(data1, currMatch)
            console.log(activeGames);

            playerSocket.emit("setState", [currMatch.p1_monsters, currMatch.p2_monsters, currMatch.turn])
            oppSocket.emit("setState", [currMatch.p2_monsters, currMatch.p1_monsters, currMatch.turn])

        }) 
        

    });
    
})



httpserver.listen(3502, () => console.log('listening on port 3501'))