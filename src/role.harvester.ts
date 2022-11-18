import { findDroppedEnergySource, harvestEnergy } from "creepFunctions";
import _ from "lodash";

var roleHarvester = {
  /** @param {Creep} creep **/
  run: function (creep: Creep) {
    if (!creep.memory.working && creep.store.getUsedCapacity() == 0) {
      creep.memory.working = true;
      creep.say("🔄 harvest");
    }
    if (creep.memory.working && creep.store.getFreeCapacity() == 0) {
      creep.memory.working = false;
      creep.say("⚡ transfer");
    }

    if (creep.memory.working) {
      if (creep.memory.justPickup) {
        let knownDroppedEnergy = Game.getObjectById(
          creep.memory.droppedEnergyId!
        );
        if (!knownDroppedEnergy) {
          // console.log(`no dropped energy for creep ${creep.name}`);
          delete creep.memory.droppedEnergyId;
          knownDroppedEnergy = findDroppedEnergySource(creep);
        }
        if (knownDroppedEnergy) {
          if (creep.memory.sourceId) {
            delete creep.memory.sourceId;
          }
          if (creep.pos.isNearTo(knownDroppedEnergy.pos)) {
            var couldPickup = creep.pickup(knownDroppedEnergy);
            if (couldPickup !== 0) {
              delete creep.memory.droppedEnergyId;
            }
          } else {
            var couldMove = creep.travelTo(knownDroppedEnergy);
            if (couldMove !== 0) {
              delete creep.memory.droppedEnergyId;
            }
          }
        } else {
          if (creep.room.memory.underAttack) {
            harvestEnergy(creep, false);
          } else if (!creep.pos.isNearTo(Game.flags[creep.memory.homeRoom+"Flag1"])) {
            creep.travelTo(Game.flags[creep.memory.homeRoom+"Flag1"]);
            creep.say("🤡 idle");
          } else {
            return;
          }
        }
      } else {
        harvestEnergy(creep, false);
      }
    } else {
      // if under attack ensure tower is full
      if (creep.room.memory.underAttack) {
        var towers = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (
              structure.structureType == STRUCTURE_TOWER &&
              structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            );
          },
        });

        if (towers.length != 0) {
          var structure = creep.pos.findClosestByRange(towers);
          if (structure) {
            if (creep.pos.isNearTo(structure)) {
              creep.transfer(structure, RESOURCE_ENERGY);
            } else {
              creep.travelTo(structure);
            }
          }
          return;
        }
      }

      // start of managing other resources it picked up
      if (_.findKey(creep.store) != RESOURCE_ENERGY) {
        let containers = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (
              (structure.structureType == STRUCTURE_CONTAINER &&
                structure.store.getFreeCapacity() != 0) ||
              (structure.structureType == STRUCTURE_STORAGE &&
                structure.store.getFreeCapacity() != 0)
            );
          },
        });
        if (creep.pos.isNearTo(containers[0])) {
          creep.transfer(
            containers[0],
            _.findKey(creep.store) as ResourceConstant
          );
        } else {
          creep.travelTo(containers[0]);
        }
        return;
      }

      // end of other resource management

      var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            (structure.structureType == STRUCTURE_EXTENSION ||
              structure.structureType == STRUCTURE_SPAWN ||
              structure.structureType == STRUCTURE_TOWER) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        },
      });

      if (targets.length > 0) {
        var structure = creep.pos.findClosestByRange(targets);
        if (structure) {
          if (creep.pos.isNearTo(structure)) {
            creep.transfer(structure, RESOURCE_ENERGY);
          } else {
            creep.travelTo(structure);
          }
        }
      } else {
        creep.say("i am looking for container");
        let containers = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (
              (structure.structureType == STRUCTURE_CONTAINER &&
                structure.store.getFreeCapacity() != 0) ||
              (structure.structureType == STRUCTURE_STORAGE &&
                structure.store.getFreeCapacity() != 0)
            );
          },
        });
        if (containers && containers.length > 0) {
          console.log("containers", containers.length);
          // creep.say("i found a container");
          if (creep.pos.isNearTo(containers[0])) {
            creep.transfer(containers[0], RESOURCE_ENERGY);
          } else {
            creep.travelTo(containers[0]);
          }
        } else {
          if (!creep.pos.isNearTo(Game.flags[creep.memory.homeRoom+"Flag1"])) {
            creep.travelTo(Game.flags[creep.memory.homeRoom+"Flag1"]);
            creep.say("🤡 idle");
          } else {
            return;
          }
        }
      }
    }
  },
};

export { roleHarvester };
