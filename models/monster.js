class Monster {
    constructor(hp, name, status, ability, id, owner, baseAtk, baseDef, baseSpd, baseStamina, modifHp, modifAtk, modifDef, modifSpd, imgPath) {
        this.id = id;
        this.owner = owner;
        this.name = name;
        this.status = status
        this.currHp = hp * modifHp;
        this.hp = hp;
        this.currAtk = baseAtk * modifAtk
        this.currDef = baseDef * modifDef
        this.currSpd = baseSpd * modifSpd
        this.imgPath = imgPath
        this.currStamina = baseStamina
        this.ability = ability;
    }
}

module.exports = Monster;