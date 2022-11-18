import { moveToRoom, recycleCreep } from "creepFunctions";

var roleHealer = {
  /** @param {Creep} creep **/
  run: function (creep: Creep) {
    if (creep.memory.targetRoom && creep.room.name != creep.memory.targetRoom || (creep.pos.x == 0 || creep.pos.y == 0)) {
      moveToRoom(creep, creep.memory.targetRoom!);
    } else {
      var creepsToHeal = creep.room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
          // find defenders first
          if (creep.memory.role === "defender" && creep.hits < creep.hitsMax) {
            return true;
          } else {
            // all defenders are okay, heal others
            return creep.hits < creep.hitsMax;
          }
        },
      });
      if (creepsToHeal.length > 0) {
        if (creep.pos.inRangeTo(creepsToHeal[0], 3)) {
          creep.rangedHeal(creepsToHeal[0]);
        } else {
          creep.travelTo(creepsToHeal[0]);
        }
        if (creep.pos.isNearTo(creepsToHeal[0])) {
          creep.heal(creepsToHeal[0]);
        } else {
          creep.travelTo(creepsToHeal[0]);
        }
      } else if (!creep.room.memory.underAttack) {
        creep.memory.targetRoom = creep.memory.homeRoom;
        recycleCreep(creep);
      }
    }
  },
};

export { roleHealer };
