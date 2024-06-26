const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const Monster = require('./models/monster.js');
const Game = require('./models/game.js');
const socketService = require('./services/socketService.js');

const app = express();
app.use(cors());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {cors: '*'})

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
    //console.log(numClients)
    //console.log(`User ${socket.id} connected!`)

    let currUserName 

    socket.on("join server", (username) => {
        //store username -> map it to socket.
        //console.log(username)
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
        //console.log(duelRequest.player + " has requested to duel " + duelRequest.opponent + "!")

        let playerSocketID = users[duelRequest.player].id;
        let oppSocketID = users[duelRequest.opponent].id;

        //Function -> check if other player is not in any room
        
        if(!socketService.isSocketInRoom(oppSocketID, io) && playerSocketID !== oppSocketID){
            //If yes
            io.to(oppSocketID).emit("duelRequest", duelRequest);
            //setBattle(true)
        }
        else{
            //If no
            socket.emit("AlertMessage", duelRequest.opponent + " maybe dueling someone else.");
            //setBattle(false)
        }

    });
    
    socket.on("duelAccept", async (duelRequest) => {

        let playerSocket = users[duelRequest.player];
        let oppSocket = users[duelRequest.opponent];

        playerSocket.emit("duelJoin");
        oppSocket.emit("duelJoin");
        
        let p1mon = await socketService.getPlayerMonsters(duelRequest.player);
        let p2mon = await socketService.getPlayerMonsters(duelRequest.opponent);

        const matchID = uuidv4();

        let new_p1_monsters = p1mon.map((m) => {return new Monster(m.base_hp, m.alt_name, 'alive', m.abilities, m.mid, m.uid, m.base_atk, m.base_def, m.base_spd, m.base_stamina, m.modif_hp, m.modif_atk, m.modif_def, m.modif_spd, m.img_path)});
        let new_p2_monsters = p2mon.map((m) => {return new Monster(m.base_hp, m.alt_name, 'alive', m.abilities, m.mid, m.uid, m.base_atk, m.base_def, m.base_spd, m.base_stamina, m.modif_hp, m.modif_atk, m.modif_def, m.modif_spd, m.img_path)});
        
        //mIDTurnOrder
        const allmon = new_p1_monsters.concat(new_p2_monsters) 
        const mIDTurnOrder = allmon.map((m) => {
            return {mid: m.id, speed : m.currSpd}
        }).sort((a, b) => b.speed - a.speed)

        const newGame = new Game(matchID, new_p1_monsters, new_p2_monsters, mIDTurnOrder[0].mid);
        activeGames.set(matchID, newGame);

        //Send both players to a new room.
        playerSocket.join(matchID);
        oppSocket.join(matchID);

        //Start Game.
        
        //Init State
        playerSocket.emit("setState", [newGame.p1_monsters, newGame.p2_monsters, newGame.turn])
        oppSocket.emit("setState", [newGame.p2_monsters, newGame.p1_monsters, newGame.turn])

        playerSocket.on("disconnect", async (reason) => {
            oppSocket.emit("hasWon", true)
            socketService.leaveMatch(playerSocket, matchID);
            playerSocket.removeAllListeners("Ability");
            await socketService.giveRewards(duelRequest.opponent, duelRequest.player)
        }) 

        oppSocket.on("disconnect", async (reason) => {
            playerSocket.emit("hasWon", true)
            socketService.leaveMatch(oppSocket, matchID);
            oppSocket.removeAllListeners("Ability");
            await socketService.giveRewards(duelRequest.player, duelRequest.opponent)
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
            //console.log("Game Manager - id : " + matchID)
            await socketService.gameManager(nameTarget, currMatch, mIDTurnOrder)
            //console.log(activeGames);

            playerSocket.emit("setState", [currMatch.p1_monsters, currMatch.p2_monsters, currMatch.turn])
            oppSocket.emit("setState", [currMatch.p2_monsters, currMatch.p1_monsters, currMatch.turn])

            if(await socketService.isGameFinished(currMatch, duelRequest) === 1){
                playerSocket.emit("hasWon", true)
                oppSocket.emit("hasWon", false)
                await socketService.giveRewards(duelRequest.player, duelRequest.opponent)
            }
            else if(await socketService.isGameFinished(currMatch, duelRequest) === 2){
                oppSocket.emit("hasWon", true)
                playerSocket.emit("hasWon", false)
                await socketService.giveRewards(duelRequest.opponent, duelRequest.player)
            }

        }) 

        oppSocket.on("Ability", async nameTarget => {

            let currMatch = activeGames.get(matchID);
            //console.log("Game Manager - id : " + matchID)
            await socketService.gameManager(nameTarget, currMatch, mIDTurnOrder)
            //console.log(activeGames);

            playerSocket.emit("setState", [currMatch.p1_monsters, currMatch.p2_monsters, currMatch.turn])
            oppSocket.emit("setState", [currMatch.p2_monsters, currMatch.p1_monsters, currMatch.turn])

            if(socketService.isGameFinished(currMatch, duelRequest) === 1){
                playerSocket.emit("hasWon", true)
                oppSocket.emit("hasWon", false)
                await socketService.giveRewards(duelRequest.player, duelRequest.opponent)
            }
            else if(socketService.isGameFinished(currMatch, duelRequest) === 2){
                oppSocket.emit("hasWon", true)
                playerSocket.emit("hasWon", false)
                await socketService.giveRewards(duelRequest.opponent, duelRequest.player)
            }

        }) 
        
    });
    
})

const PORT = process.env.PORT || 3500;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});