import _ from "lodash";
import { moveTo } from 'screeps-cartographer';

export function findEnergySource(creep: Creep) {
  // let sources = creep.room.find(FIND_SOURCES);
  let sources = creep.room.memory.resources!.energy;
  let foundSource = null;
  _.each(sources, (source, index) => {
    // let sourceObject = Game.getObjectById(source.id);
    let sourceObject = Game.getObjectById(source.id);
    if (
      source.beingMined === true &&
      source.beingMinedBy != creep.name &&
      sourceObject?.energy! > 0
    ) {
      return;
    } else {
      // creep.memory.sourceId = source.id;
      if (creep.memory.role === "miner") {
        source.beingMined = creep.memory.role === "miner";
        source.beingMinedBy = creep.name;
      } else if (!(sourceObject!.pos as RoomPositionExtra).getOpenPositions().length) {
        return;
      }
      // Added this else to help with rooms not having enough space for multiple, remove if breaks
      
      creep.memory.sourceId = source.id;
      foundSource = sourceObject;
      return false;
    }
  });
  return foundSource;
}

export function findDroppedEnergySource(creep: Creep) {
  //need to optimise
  let droppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
    filter: (resource) => {
      return resource.amount >= 100;
    },
  });
  if (droppedEnergy) {
    creep.memory.droppedEnergyId = droppedEnergy.id;
    return droppedEnergy;
  }
  return null;
}

export function harvestEnergy(creep: Creep, isMiner: boolean) {
  let knownDroppedEnergy = Game.getObjectById(creep.memory.droppedEnergyId!);

  let storedSource = Game.getObjectById(creep.memory.sourceId!);

  // && !creep.pos.isNearTo(knownDroppedEnergy!) was removed..
  if (!knownDroppedEnergy && !isMiner) {
    // console.log(`no dropped energy for creep ${creep.name}`);
    delete creep.memory.droppedEnergyId;
    knownDroppedEnergy = findDroppedEnergySource(creep);
  }

  if (knownDroppedEnergy && !isMiner) {
    // console.log(`${creep.name} is looking for dropped energy`)
    // if (knownDroppedEnergy?.amount! > 0) {
    delete creep.memory.sourceId;
    if (creep.pos.isNearTo(knownDroppedEnergy.pos)) {
      var couldPickup = creep.pickup(knownDroppedEnergy);
      if (couldPickup !== 0) {
        delete creep.memory.droppedEnergyId;
      }
    } else {
      var couldMove = moveTo(creep,knownDroppedEnergy);
      if (couldMove !== 0) {
        delete creep.memory.droppedEnergyId;
      }
    }
    // }
  } else {
    //|| storedSource.energy == 0 removed
    if (
      !storedSource ||
      (!(storedSource.pos as RoomPositionExtra).getOpenPositions().length &&
        !creep.pos.isNearTo(storedSource))
    ) {
      console.log(
        `no open positions or energy left at source for creep ${creep.name}`
      );
      delete creep.memory.sourceId;
      storedSource = findEnergySource(creep);
    }
    if (storedSource) {
      if (creep.pos.isNearTo(storedSource)) {
        creep.harvest(storedSource);
      } else {
        if ((storedSource.pos as RoomPositionExtra).getOpenPositions().length) {
          moveTo(creep,storedSource!);
          // creep.memory.working = false;
        } else {
          console.log(
            `Creep ${creep.name} can't find a position on new source`
          );
        }
      }
    }
  }
}

export function withdrawFromContainer(creep: Creep) {
  let containers = creep.room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return (
        (structure.structureType == STRUCTURE_CONTAINER ||
          structure.structureType == STRUCTURE_STORAGE) &&
        structure.store[RESOURCE_ENERGY] > 0
      );
    },
  });
  if (containers.length === 0) {
    // commenting out as causing high CPU calls
    // if (creep.memory.role === "builder") {
    let knownDroppedEnergy = Game.getObjectById(creep.memory.droppedEnergyId!);

    // || !creep.pos.isNearTo(knownDroppedEnergy) removed..
    if (!knownDroppedEnergy) {
      console.log(`no known dropped energy near for creep ${creep.name}`);
      delete creep.memory.droppedEnergyId;
      knownDroppedEnergy = findDroppedEnergySource(creep);
    }

    if (knownDroppedEnergy) {
      if (creep.memory.sourceId) {
        delete creep.memory.sourceId;
      }
      if (creep.pos.isNearTo(knownDroppedEnergy?.pos!)) {
        creep.pickup(knownDroppedEnergy!);
      } else {
        moveTo(creep,knownDroppedEnergy!);
      }
    }
    else if (!creep.pos.isNearTo(Game.flags[creep.memory.homeRoom+"Flag1"])) {
      moveTo(creep,Game.flags[creep.memory.homeRoom+"Flag1"]);
      creep.say("⏳ Waiting");
      
      creep.memory.withdrawWait = Game.time + 10;
      } else {
        return;
      }
    // }
  } else {
    var container = creep.pos.findClosestByRange(containers);
    if (container && creep.pos.isNearTo(container)) {
      creep.withdraw(container, RESOURCE_ENERGY);
    } else {
      moveTo(creep,container!);
    }
  }
}

export function recycleCreep(creep: Creep) {

  if (!creep.memory.spawnToRecycleId) {
    var spawner = _.filter(Game.spawns, (spawn) => spawn.room.name === creep.memory.homeRoom);
    if (spawner.length > 0) {
      creep.memory.spawnToRecycleId = spawner[0].id;
    }
  }

  let spawn = Game.getObjectById(creep.memory.spawnToRecycleId!);

  if (spawn?.room.name !== creep.memory.targetRoom) {
    creep.memory.targetRoom = spawn?.room.name;
  }

  if (!creep.pos.isNearTo(spawn!)) {
    moveTo(creep,spawn!);
    creep.say("⏳ no work");
  } else {
    spawn!.recycleCreep(creep);
  }
}

export function moveToRoom(
  creep: Creep,
  roomName: string,
  xPos = 25,
  yPos = 25
) {
  if (!roomName) {
    console.log("got an empty roomName for creep", creep.name, roomName);
  } else {
    creep.travelTo(new RoomPosition(xPos, yPos, roomName), { range: 10 });
  }
}

export function isExit(pos: Coord): boolean {
  return pos.x === 0 || pos.y === 0 || pos.x === 49 || pos.y === 49;
}