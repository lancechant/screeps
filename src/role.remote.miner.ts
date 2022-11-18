import { moveToRoom } from "creepFunctions";
import _ from "lodash";

var roleRemoteMiner = {
  /** @param {Creep} creep **/
  run: function (creep: Creep) {

    // _.filter(creep.room.memory.resources)
    if (creep.room.name == creep.memory.homeRoom) {
        moveToRoom(creep, creep.memory.targetRoom!, creep.memory.remotePos?.x, creep.memory.remotePos?.y)
    } else {

      // This should hopefully only fire once per new remote room
      if (!creep.memory.sourceId || !creep.memory.remotePos) {
        if (creep.room.name === creep.memory.targetRoom) {
          let sources = creep.room.find(FIND_SOURCES);
          _.forEach(sources, (source) => {
            let remoteSources = Memory.rooms[creep.memory.homeRoom].remoteSources?.filter(t => t.roomName === creep.room.name);
            if (remoteSources?.length === 1) {
              remoteSources[0].sourceId = source.id;
              remoteSources[0].sourcePos = source.pos;

              // this is first time in the remote room, so set values in memory, but also assign a creep a source
              creep.memory.sourceId = source.id;
              creep.memory.remotePos = source.pos;
            } else {
              const remoteSource: RemoteSource = {
                roomsAvailable: true,
                roomName: creep.room.name,
                sourceId: source.id,
                sourcePos: source.pos
              }
              remoteSources?.push(remoteSource)
            }
          })
        }
      } else {
        let storedSource = Game.getObjectById(creep.memory.sourceId);
        if (storedSource) {
          if (creep.pos.isNearTo(storedSource)) {
            // if (creep.pos.isNearTo(storedSource)) {
            creep.harvest(storedSource);
            // } else {
            // creep.memory.working = true;
            // }
          } else {
            // if ((storedSource.pos as RoomPositionExtra).getOpenPositions().length) {
              creep.travelTo(storedSource!);
              // creep.memory.working = false;
            // } else {
            //   console.log(
            //     `Creep ${creep.name} can't find a position on new source`
            //   );
            // }
          }
        }
      }
    }
  },
};

export { roleRemoteMiner };

