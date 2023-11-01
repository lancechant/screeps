import { moveToRoom } from "creepFunctions";

var roleRemoteTransport = {
  /** @param {Creep} creep **/
  run: function (creep: Creep) {
    if (!creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.working = true;
      creep.say("🔄 harvest");
    }
    if (creep.memory.working && creep.store.getFreeCapacity() == 0) {
      creep.memory.working = false;
      creep.say("⚡ transfer");
    }

    if (creep.memory.working) {
      if (creep.room.name == creep.memory.homeRoom) {
        moveToRoom(
          creep,
          creep.memory.targetRoom!,
          creep.memory.remotePos?.x,
          creep.memory.remotePos?.y
        );
      } else {
        // This should hopefully only fire once per new remote room
        let knownDroppedEnergy = Game.getObjectById(
          creep.memory.droppedEnergyId!
        );

        if (!knownDroppedEnergy && !creep.pos.isNearTo(knownDroppedEnergy!)) {
          // console.log(`no dropped energy for creep ${creep.name}`);
          delete creep.memory.droppedEnergyId;
          knownDroppedEnergy = findDroppedEnergySourceRemote(creep);
        }
        if (knownDroppedEnergy) {
          // console.log(`${creep.name} is looking for dropped energy`)
          if (knownDroppedEnergy?.amount! > 0) {
            if (creep.pos.isNearTo(knownDroppedEnergy?.pos!)) {
              creep.pickup(knownDroppedEnergy!);
            } else {
              var couldMove = creep.travelTo(knownDroppedEnergy!);
              if (couldMove !== 0) {
                delete creep.memory.droppedEnergyId;
              }
            }
          }
        }
      }
    } else {
      if (creep.room.name != creep.memory.homeRoom) {
          moveToRoom(creep, creep.memory.homeRoom);
      } else {
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
          if (creep.pos.isNearTo(containers[0])) {
            creep.transfer(containers[0], RESOURCE_ENERGY);
          } else {
            creep.travelTo(containers[0]);
          }
        } else {
          if (
            !creep.pos.isNearTo(Game.flags[creep.memory.homeRoom + "Flag1"])
          ) {
            creep.travelTo(Game.flags[creep.memory.homeRoom + "Flag1"]);
            creep.say("🤡 idle");
          } else {
            return;
          }
        }
      }
    }
  },
};

function findDroppedEnergySourceRemote(creep: Creep) {
  let droppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
  if (droppedEnergy) {
    creep.memory.droppedEnergyId = droppedEnergy.id;
    return droppedEnergy;
  }
  return null;
}

export { roleRemoteTransport };
