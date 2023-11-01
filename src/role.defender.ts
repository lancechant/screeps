import { isExit, moveToRoom, recycleCreep } from "creepFunctions";
import _ from "lodash";
import { moveTo } from 'screeps-cartographer';

var roleDefender = {
  /** @param {Creep} creep **/
  run: function (creep: Creep) {
    if (creep.memory.targetRoom && creep.room.name != creep.memory.targetRoom || isExit(creep.pos)) {
      moveToRoom(creep, creep.memory.targetRoom!);
    } else {
      var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS, {
        filter: (creep) => {
  
          if (creep.owner.username.includes("Malkaar") || creep.owner.username.includes("Takoizu") || creep.owner.username.includes("SaintPurple")) {
            return false;
          }
  
          return creep.owner.username === 'Invader' ||
          (creep.getActiveBodyparts(HEAL) > 0 || creep.getActiveBodyparts(ATTACK) > 0 || creep.getActiveBodyparts(RANGED_ATTACK) > 0)
        }
      });
      if (hostileCreeps.length > 0) {
        hostileCreeps = _.sortBy(hostileCreeps, (hostile) => hostile.getActiveBodyparts(HEAL) > 0);
        if (creep.body.find((t) => t.type === RANGED_ATTACK && t.hits != 0)) {
          if (creep.pos.inRangeTo(hostileCreeps[0], 3)) {
            creep.rangedAttack(hostileCreeps[0]);
          } else {
            creep.travelTo(hostileCreeps[0]);
          }
        }
        if (creep.pos.isNearTo(hostileCreeps[0])) {
          creep.attack(hostileCreeps[0]);
        } else {
          creep.travelTo(hostileCreeps[0]);
        }
      } else {
        creep.memory.targetRoom = creep.memory.homeRoom;
        recycleCreep(creep);
      }
    }
  },
};

export { roleDefender };
