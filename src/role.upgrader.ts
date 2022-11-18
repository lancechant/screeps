import { withdrawFromContainer } from "creepFunctions";

var roleUpgrader = {

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
            if(creep.upgradeController(creep.room.controller!) == ERR_NOT_IN_RANGE) {
                console.log('trying to move')
                creep.travelTo(creep.room.controller!);
            }
        }
        else {
            if (!creep.memory.withdrawWait || Game.time > creep.memory.withdrawWait) {
                withdrawFromContainer(creep);
            }
        }
	}
};

export { roleUpgrader };