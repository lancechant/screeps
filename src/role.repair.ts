import { withdrawFromContainer } from "creepFunctions";
import _ from "lodash";

var roleRepair = {
  /** @param {Creep} creep **/
  run: function (creep: Creep) {
    if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.working = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
      creep.memory.working = true;
      creep.say("🛠 repair");
    }

    if (!creep.memory.working) {
      if (!creep.memory.withdrawWait || Game.time > creep.memory.withdrawWait) {
        withdrawFromContainer(creep);
      }
    } else {
      let target = Game.getObjectById(creep.memory.structureBeingRepaired!);

      if (!target || target.hits == target.hitsMax) {
        // console.log(`no dropped energy for creep ${creep.name}`);
        if (target) {
          _.remove(creep.room.memory.buildingToBeRepaired!, (building) => {
            return (
              building.id === creep.memory.structureBeingRepaired ||
              building.hits === building.hitsMax
            );
          });
        }
        if (creep.memory.structureBeingRepaired) {
          delete creep.memory.structureBeingRepaired;
        }

        var targets = creep.room.memory.buildingToBeRepaired;

        if (!targets || targets.length == 0) {
          creep.travelTo(Game.flags[creep.memory.homeRoom+"Flag1"]);
          return;
        }

        if (targets.length === 1) {
          target = Game.getObjectById(targets[0].id);
        }

        targets = _.filter(targets, (targetToRepair) => !targetToRepair.beingRepaired);
        targets.sort((a, b) => a.hits - b.hits);
        if (targets && targets.length > 0) {
          target = Game.getObjectById(targets[0].id);
          targets[0].beingRepaired = true;
        }
      }

      if (target) {
        creep.memory.structureBeingRepaired = target.id;
        if (creep.pos.isNearTo(target.pos)) {
          creep.repair(target);
        } else {
          creep.travelTo(target.pos);
        }
      } else {
        creep.travelTo(Game.flags[creep.memory.homeRoom+"Flag1"]);
      }
    }
  },
};

export { roleRepair };
