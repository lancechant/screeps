import { harvestEnergy, moveToRoom, recycleCreep, withdrawFromContainer } from "creepFunctions";
import _ from "lodash";
import { moveTo } from 'screeps-cartographer';

var roleBuilder = {
  /** @param {Creep} creep **/
  run: function (creep: Creep) {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
      creep.say("🚧 build");
    }

    if (creep.memory.building) {

      if (creep.room.name !== creep.memory.targetRoom) {
        moveToRoom(creep, creep.memory.targetRoom!, creep.memory.remotePos?.x, creep.memory.remotePos?.y)
        return;
      }

      let target = Game.getObjectById(creep.memory.structureToBuild!);


      if (!target || target.progress === target.progressTotal) {
        // console.log(`no dropped energy for creep ${creep.name}`);

        if (target) {
          _.remove(creep.room.memory.constructionSites!, (building) => {
            return building.id === creep.memory.structureToBuild || building.progress === building.progressTotal ||
            Game.getObjectById(building.id) == null
          });
        }

        if (creep.memory.structureToBuild) {
          delete creep.memory.structureToBuild;
        }

        var targets = creep.room.memory.constructionSites;

        if (!targets || targets.length == 0) {
          recycleCreep(creep);
          return;
        }

        if (Game.getObjectById(targets[0].id) == null) {
          _.remove(creep.room.memory.constructionSites!, (building) => building.id === targets![0].id);
        } else {
          if (target === Game.getObjectById(targets[0].id) && targets.length > 1) {
            target = Game.getObjectById(targets[1].id)
          } else {
  
            target = Game.getObjectById(targets[0].id);
          }
        }
      }

      // var extentions = targets.filter(t => t.structureType === STRUCTURE_EXTENSION);

      // console.log("extentions", extentions);

      if (target) {

        creep.memory.structureToBuild = target.id;
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
          creep.travelTo(target);
        }
      } else {
        recycleCreep(creep);
      }
    } else {
      if (creep.room.name === creep.memory.homeRoom) {
        if (!creep.memory.withdrawWait || Game.time > creep.memory.withdrawWait) {
          withdrawFromContainer(creep);
        }
      } else {
        // we are remote building, and possibly need to harvest
        harvestEnergy(creep, false);
      }
    }
  },
};

export { roleBuilder };
