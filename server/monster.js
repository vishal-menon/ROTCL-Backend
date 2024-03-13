export class monster {
    constructor(hp, name, status, ability, id, owner) {
        this.id = id;
        this.owner = owner;
        this.name = name;
        this.status = status
        this.currHp = hp;
        this.hp = hp;
        this.ability = ability;
    }
}