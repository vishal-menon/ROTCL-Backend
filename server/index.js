import { createServer } from "http"
import { Server } from "socket.io"

class monster {
    constructor(hp, name, ability, id, owner) {
        this.id = id;
        this.owner = owner;
        this.name = name;
        this.currHp = hp;
        this.hp = hp;
        this.ability = ability;
    }
}

const httpserver = createServer()

const monsters_p1 = [
    {
        id : 0,
        name : 'm1',
        hp : 100,
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
        hp : 1000,
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
        hp : 800,
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
        hp : 1500, 
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

let p1_monsters = monsters_p1.map((m) => {return new monster(m.hp, m.name, m.ability, m.id, m.owner)})
let p2_monsters = monsters_p2.map((m) => {return new monster(m.hp, m.name, m.ability, m.id, m.owner)})

let all_monsters = p1_monsters.concat(p2_monsters)
let monster_ids = all_monsters.map(monster => monster.id)
let turnIndex = 0
let turn = monster_ids[turnIndex]


io.on('connection', socket => {
    const numClients = io.engine.clientsCount;
    console.log(numClients)
    console.log(`User ${socket.id} connected!`)

    let pNum

    //Init State
    if(numClients === 1)
    {
        pNum = 1
        console.log("sending player 1 info")
        socket.emit("setState", [p1_monsters, p2_monsters, turn])
    }
    else
    {
        pNum = 2
        console.log("sending player 2 info")
        socket.emit("setState", [p2_monsters, p1_monsters, turn])
    }

    socket.on('Ability', data1 => {
        //data should contain -> ability + inflicted pet
        // data -> [ability, petID]

        //Need a function to find pet based on id.

        //Need a function to damage pet.

        p1_monsters.forEach(pet => {
            if(pet.id === parseInt(data1[1])){
                pet.currHp -= parseInt(data1[0])
            }
        });

        p2_monsters.forEach(pet => {
            if(pet.id === parseInt(data1[1])){
                pet.currHp -= parseInt(data1[0])
            }
        });

        turnIndex = ((turnIndex + 1) % (p1_monsters.length + p2_monsters.length))
        turn = monster_ids[turnIndex]

        //Update State
        if(pNum === 1){
            console.log("sending player 1 info - post ability")
            socket.emit("setState", [p1_monsters, p2_monsters, turn])
            socket.broadcast.emit("setState", [p2_monsters, p1_monsters, turn])
        }
        else{
            console.log("sending player 2 info - post ability")
            socket.emit("setState", [p2_monsters, p1_monsters, turn])
            socket.broadcast.emit("setState", [p1_monsters, p2_monsters, turn])
        }

    });
    
    socket.on('message', data =>{
        console.log(data)
    });
})



httpserver.listen(3502, () => console.log('listening on port 3501'))