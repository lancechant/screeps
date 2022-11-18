import {
  moveToRoom
} from "creepFunctions";

var roleRemoteClaimer = {
  /** @param {Creep} creep **/
  run: function (creep: Creep) {
    if (creep.room.name == creep.memory.homeRoom) {
      moveToRoom(
        creep,
        creep.memory.targetRoom!,
        creep.memory.remotePos?.x,
        creep.memory.remotePos?.y
      );
    } else {
      var roomController = creep.room.controller;
      if (roomController) {
        if (creep.pos.isNearTo(roomController)) {
          creep.reserveController(roomController);
        } else {
          creep.travelTo(roomController);
        }
      } else {
        Game.notify(`${creep.name} couldn't find a controller in room ${creep.memory.targetRoom}`)
      }
    }
  },
};

export { roleRemoteClaimer };

