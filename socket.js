const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const Monster = require('./models/monster.js');
const Game = require('./models/game.js');
const socketService = require('./services/socketService.js')

const app = express();
app.use(cors());

const httpServer = http.createServer(app);

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

const io = new Server(httpServer, {
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
        console.log(duelRequest.player + " has requested to duel " + duelRequest.opponent + "!")

        let playerSocketID = users[duelRequest.player].id;
        let oppSocketID = users[duelRequest.opponent].id;

        
       
        //Function -> check if other player is not in any room
        
        if(!socketService.isSocketInRoom(oppSocketID, io) && playerSocketID !== oppSocketID){
            //If yes
            io.to(oppSocketID).emit("duelRequest", duelRequest);
            setBattle(true)
        }
        else{
            //If no
            socket.emit("AlertMessage", duelRequest.opponent + " maybe dueling someone else.");
            setBattle(false)
        }

    });
    
    socket.on("duelAccept", async (duelRequest) => {

        let playerSocket = users[duelRequest.player];
        let oppSocket = users[duelRequest.opponent];

        let p1mon = await socketService.getPlayerMonsters(duelRequest.player);
        let p2mon = await socketService.getPlayerMonsters(duelRequest.opponent);
        
        console.log("I am p1mon")
        console.log(p1mon.map((m)=>{console.log(m)}))

        // console.log(p1mon)
        // console.log("console.log dat shit!")
        // let test = await socketService.getTestingMonster('Duck');
        // console.log(test)

        const matchID = uuidv4();

        let new_p1_monsters = p1mon.map((m) => {return new Monster(m.base_hp, m.alt_name, 'alive', m.abilities, m.mid, m.uid, m.base_atk, m.base_def, m.base_spd, m.base_stamina, m.modif_hp, m.modif_atk, m.modif_def, m.modif_spd, m.img_path)});
        let new_p2_monsters = p2mon.map((m) => {return new Monster(m.base_hp, m.alt_name, 'alive', m.abilities, m.mid, m.uid, m.base_atk, m.base_def, m.base_spd, m.base_stamina, m.modif_hp, m.modif_atk, m.modif_def, m.modif_spd, m.img_path)});

        let p1_monsters = monsters_p1.map((m) => {return new Monster(m.hp, m.name, m.status, m.ability, m.id, m.owner)})
        let p2_monsters = monsters_p2.map((m) => {return new Monster(m.hp, m.name, m.status, m.ability, m.id, m.owner)})
        
        //mIDTurnOrder
        const allmon = new_p1_monsters.concat(new_p2_monsters) 
        const mIDTurnOrder = allmon.map((m) => {
            return {mid: m.id, speed : m.currSpd}
        }).sort((a, b) => b.speed - a.speed)

        console.log(mIDTurnOrder)

        const newGame = new Game(matchID, new_p1_monsters, new_p2_monsters, mIDTurnOrder[0].mid);
        activeGames.set(matchID, newGame);

        //Send both players to a new room.
        playerSocket.join(matchID);
        oppSocket.join(matchID);

        //Start Game.
       // console.log(activeGames);
       console.log("newGame.p1_monsters")
       console.log(newGame.p1_monsters)
        
        //Init State
        playerSocket.emit("setState", [newGame.p1_monsters, newGame.p2_monsters, newGame.turn])
        oppSocket.emit("setState", [newGame.p2_monsters, newGame.p1_monsters, newGame.turn])

        playerSocket.on("disconnect", (reason) => {
            oppSocket.emit("hasWon", true)
            socketService.leaveMatch(playerSocket, matchID);
            playerSocket.removeAllListeners("Ability");
        }) 

        oppSocket.on("disconnect", (reason) => {
            playerSocket.emit("hasWon", true)
            socketService.leaveMatch(oppSocket, matchID);
            oppSocket.removeAllListeners("Ability");
        }) 
        
        playerSocket.on("exitMatch", () => {
            socketService.leaveMatch(playerSocket, matchID);
            playerSocket.removeAllListeners("Ability");
            activeGames.delete(matchID)
        }) 

        oppSocket.on("exitMatch", () => {
            socketService.leaveMatch(oppSocket, matchID);
            oppSocket.removeAllListeners("Ability");
        }) 

        
        playerSocket.on("Ability", async nameTarget => {
            
            let currMatch = activeGames.get(matchID);
            console.log("Game Manager - id : " + matchID)
            await socketService.gameManager(nameTarget, currMatch, mIDTurnOrder)
            console.log(activeGames);

            playerSocket.emit("setState", [currMatch.p1_monsters, currMatch.p2_monsters, currMatch.turn])
            oppSocket.emit("setState", [currMatch.p2_monsters, currMatch.p1_monsters, currMatch.turn])

            if(await socketService.isGameFinished(currMatch, duelRequest) === 1){
                playerSocket.emit("hasWon", true)
                oppSocket.emit("hasWon", false)
            }
            else if(await socketService.isGameFinished(currMatch, duelRequest) === 2){
                oppSocket.emit("hasWon", true)
                playerSocket.emit("hasWon", false)
            }

        }) 

        oppSocket.on("Ability", async nameTarget => {

            let currMatch = activeGames.get(matchID);
            console.log("Game Manager - id : " + matchID)
            await socketService.gameManager(nameTarget, currMatch, mIDTurnOrder)
            console.log(activeGames);

            playerSocket.emit("setState", [currMatch.p1_monsters, currMatch.p2_monsters, currMatch.turn])
            oppSocket.emit("setState", [currMatch.p2_monsters, currMatch.p1_monsters, currMatch.turn])

            if(await socketService.isGameFinished(currMatch, duelRequest) === 1){
                playerSocket.emit("hasWon", true)
                oppSocket.emit("hasWon", false)
            }
            else if(await socketService.isGameFinished(currMatch, duelRequest) === 2){
                oppSocket.emit("hasWon", true)
                playerSocket.emit("hasWon", false)
            }

        }) 
        
    });
    
})

const PORT = process.env.PORT || 3500;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});