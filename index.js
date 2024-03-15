import { createServer } from "http"
import { platform } from "os";
import { Server } from "socket.io"
import { v4 as uuidv4 } from 'uuid';
import { monster } from './definitions/monster.js';
import { Game } from './definitions/game.js';

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

function isSocketInRoom(socketId) {

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

io.on('connection', socket => {
    const numClients = io.engine.clientsCount;
    console.log(numClients)
    console.log(`User ${socket.id} connected!`)

    let currUserName 

    socket.on("join server", (username) => {
        //store username -> map it to socket.
        console.log(username)
        currUserName = username
        users[username] = socket

        const usernameArray = Object.keys(users);

        io.emit("update user", usernameArray);
    });

    socket.on("disconnect", (reason)=>{
        delete users[currUserName]
        const usernameArray = Object.keys(users);
        io.emit("update user", usernameArray);
    });

    socket.on("duel", (duelRequest, setBattle) => {

        /*
        duelRequest = {
           player : 'playerUsername',
           opponent : 'opponentUsername'
        };
        */
        let playerSocketID = users[duelRequest.player].id;
        let oppSocketID = users[duelRequest.opponent].id;

        console.log(duelRequest.player + " has requested to duel " + duelRequest.opponent + "!")
       
        //Function -> check if other player is not in any room
        
        if(!isSocketInRoom(oppSocketID) && playerSocketID !== oppSocketID){
            //If yes
            io.to(oppSocketID).emit("duelRequest", duelRequest);
            setBattle(true)
        }
        else{
            //If no
            socket.emit("AlertMessage", duelRequest.opponent + " maybe dueling someone else.");
            setBattle(false)
        }
2
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

        playerSocket.on("disconnect", (reason) => {
            oppSocket.emit("hasWon", true)
            leaveMatch(playerSocket, matchID);
            playerSocket.removeAllListeners("Ability");
        }) 

        oppSocket.on("disconnect", (reason) => {
            playerSocket.emit("hasWon", true)
            leaveMatch(oppSocket, matchID);
            oppSocket.removeAllListeners("Ability");
        }) 
        
        playerSocket.on("exitMatch", () => {
            leaveMatch(playerSocket, matchID);
            playerSocket.removeAllListeners("Ability");
            activeGames.delete(matchID)
        }) 

        oppSocket.on("exitMatch", () => {
            leaveMatch(oppSocket, matchID);
            oppSocket.removeAllListeners("Ability");
        }) 

        
        playerSocket.on("Ability", data1 => {
            
            let currMatch = activeGames.get(matchID);
            console.log("Game Manager - id : " + matchID)
            gameManager(data1, currMatch)
            console.log(activeGames);

            playerSocket.emit("setState", [currMatch.p1_monsters, currMatch.p2_monsters, currMatch.turn])
            oppSocket.emit("setState", [currMatch.p2_monsters, currMatch.p1_monsters, currMatch.turn])

            if(isGameFinished(currMatch) === 1){
                playerSocket.emit("hasWon", true)
                oppSocket.emit("hasWon", false)
            }
            else if(isGameFinished(currMatch) === 2){
                oppSocket.emit("hasWon", true)
                playerSocket.emit("hasWon", false)
            }

        }) 

        oppSocket.on("Ability", data1 => {

            let currMatch = activeGames.get(matchID);
            console.log("Game Manager - id : " + matchID)
            gameManager(data1, currMatch)
            console.log(activeGames);

            playerSocket.emit("setState", [currMatch.p1_monsters, currMatch.p2_monsters, currMatch.turn])
            oppSocket.emit("setState", [currMatch.p2_monsters, currMatch.p1_monsters, currMatch.turn])

            if(isGameFinished(currMatch) === 1){
                playerSocket.emit("hasWon", true)
                oppSocket.emit("hasWon", false)
            }
            else if(isGameFinished(currMatch) === 2){
                oppSocket.emit("hasWon", true)
                playerSocket.emit("hasWon", false)
            }

        }) 
        
    });
    
})



httpserver.listen(3502, () => console.log('listening on port 3501'))