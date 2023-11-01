import { recycleCreep } from "creepFunctions";
import _ from "lodash";
import { moveTo } from 'screeps-cartographer';

var roleExtractor = {
  /** @param {Creep} creep **/
  run: function (creep: Creep) {
    if (creep.memory.extracting && creep.store.getFreeCapacity() == 0) {
      creep.memory.extracting = false;
      creep.say("🔄 transfer");
    }
    if (!creep.memory.extracting && creep.store.getFreeCapacity() != 0) {
      creep.memory.extracting = true;
      creep.say("🛠 mining");
    }

    if (creep.memory.extracting) {
      var target: Mineral<MineralConstant> | null = null;
      if (creep.memory.depositId) {
        target = Game.getObjectById(creep.memory.depositId);
      } else {
        var targets = creep.room.find(FIND_MINERALS);
          target = targets[0];
          creep.memory.depositId = target.id;
          creep.memory.mineralType = target.mineralType;
      }
      
      if (target!.mineralAmount === 0) {
        creep.room.memory.mineralRegenTime = Game.time + target!.ticksToRegeneration!;
        target = null;
      }

      if (!target) {
        recycleCreep(creep);
      } else {
        if (creep.pos.isNearTo(target)) {
          creep.harvest(target);
        } else {
          creep.travelTo(target);
        }
      }
    } else {
      if (creep.room.terminal) {
        if (creep.pos.isNearTo(creep.room.terminal)) {
          creep.transfer(creep.room.terminal, creep.memory.mineralType!);
        } else {
          creep.travelTo(creep.room.terminal);
        }
      } else if (creep.room.storage) {
        if (creep.pos.isNearTo(creep.room.storage)) {
          creep.transfer(creep.room.storage, creep.memory.mineralType!);
        } else {
          creep.travelTo(creep.room.storage);
        }
      }
    }
  },
};

export { roleExtractor };
