import { harvestEnergy, moveToRoom, withdrawFromContainer } from "creepFunctions";
import _ from "lodash";

var roleRoomUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep: Creep) {

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }
        

	    if(creep.memory.upgrading) {
            if (creep.room.name !== creep.memory.targetRoom) {
                moveToRoom(creep, creep.memory.targetRoom!, creep.memory.remotePos?.x, creep.memory.remotePos?.y)
                return;
            }
            if(creep.pos.isNearTo(creep.room.controller!)) {
                creep.upgradeController(creep.room.controller!);
            } else {
                creep.travelTo(creep.room.controller!);
            }
        }
        else {
            if (creep.room.name === creep.memory.homeRoom) {
                withdrawFromContainer(creep);
            } else {
            // we are remote building, and possibly need to harvest
                harvestEnergy(creep, false);
            }
        }
	}
};

export { roleRoomUpgrader };