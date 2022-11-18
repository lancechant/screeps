import _ from "lodash";

const roomDefense = (room: Room) => {

  if (Game.time % 10 === 0) {
    var hostileCreeps = room.find(FIND_HOSTILE_CREEPS, {
      filter: (creep) => {

        if (creep.owner.username.includes("Malkaar")) {
          return false;
        }

        return creep.owner.username === 'Invader' || (creep.getActiveBodyparts(ATTACK) > 0 || creep.getActiveBodyparts(RANGED_ATTACK) > 0)
      }
    });
    if (hostileCreeps.length > 0) {
      room.memory.underAttack = true;
    } else if (room.memory.underAttack) {
        room.memory.underAttack = false;
      }
    }

    var towers: StructureTower[] = room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_TOWER },
      });
      if (towers.length) {
        _.forEach(towers, (tower) => {
          if (tower) {
            // var closestDamagedStructure = tower.pos.findClosestByRange(
            //   FIND_STRUCTURES,
            //   {
            //     filter: (structure) => structure.hits < structure.hitsMax,
            //   }
            // );
            // if (closestDamagedStructure) {
            //   tower.repair(closestDamagedStructure);
            // }
  
            var closestHostile =
              tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
              tower.attack(closestHostile);
            }
          }
        });
      }
}

export {roomDefense};