import { harvestEnergy, moveToRoom } from "creepFunctions";
import _ from "lodash";
import { moveTo } from 'screeps-cartographer';

var roleRoomClaimer = {

    /** @param {Creep} creep **/
    run: function(creep: Creep) {

        if (creep.room.name !== creep.memory.targetRoom) {
            moveToRoom(creep, creep.memory.targetRoom!, creep.memory.remotePos?.x, creep.memory.remotePos?.y)
            return;
        }

	    if(!creep.memory.working) {
            if(creep.pos.isNearTo(creep.room.controller!)) {
                var result = creep.claimController(creep.room.controller!);
                if (result === OK) {
                    var homeRoomRemote = _.find(Memory.rooms[creep.memory.homeRoom].remoteRooms!, (room) => room.roomName === creep.room.name);
                    homeRoomRemote!.hasBeenClaimed = true;
                    creep.memory.working = true;
                }
            } else {
                creep.travelTo(creep.room.controller!);
            }
        }
        else {
            harvestEnergy(creep, false);
        }
	}
};

export { roleRoomClaimer };