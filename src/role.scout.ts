import { moveToRoom } from "creepFunctions";
import _ from "lodash";

//Remove from room.functions
export function addRemoteRoomsToMemory(room: Room, scoutDirection: TOP | RIGHT | BOTTOM | LEFT) {
    const roomExits = Game.map.describeExits(room.name)
    const remoteRoomNames = Object.values(
      roomExits || {}
    );
    if (remoteRoomNames.length == 0) {
      room.memory.remoteSources = [
        {
          roomsAvailable: false,
        },
      ];
      return;
    }
    if (!room.memory.remoteSources?.length) {
      room.memory.remoteSources = [];
    }
  
    const knownRooms = Memory.rooms;

    var roomExitDirections: ExitKey[] = Object.keys(roomExits) as ExitKey[];

    // finding next room with same current direction as scouts intention
    var nextRoomExit = _.find(roomExitDirections, (exit) => exit === scoutDirection.toString());

    if (!nextRoomExit) {
      nextRoomExit = findNextRoomExit(scoutDirection, roomExitDirections)
    }
  
    _.forEach(remoteRoomNames, (remoteRoom) => {
      if (remoteRoom && !knownRooms[remoteRoom]) {
        room.memory.remoteSources?.push({
          roomName: remoteRoom,
          roomsAvailable: remoteRoomNames.length > 0,
          transporterLimit: 2,
        });
      }
    });

    if (!nextRoomExit) {
      return null;
    }

    return roomExits[nextRoomExit]
  }

function findNextRoomExit(scoutDirection: TOP | RIGHT | BOTTOM | LEFT, roomExitDirections: ExitKey[]) {
  var nextRoom;
  switch(scoutDirection) {
    case TOP:
      nextRoom = _.find(roomExitDirections, (exit) => exit === LEFT.toString())
    case BOTTOM:
      nextRoom = _.find(roomExitDirections, (exit) => exit === RIGHT.toString())
    case RIGHT:
      nextRoom = _.find(roomExitDirections, (exit) => exit === TOP.toString())
    case LEFT:
      nextRoom = _.find(roomExitDirections, (exit) => exit === BOTTOM.toString())
  }
  return nextRoom;
}

var roleScout = {
    /** @param {Creep} creep **/
    run: function (creep: Creep) {
        if (creep.memory.targetRoom && creep.room.name != creep.memory.targetRoom) {
            moveToRoom(
                creep,
                creep.memory.targetRoom!,
                creep.memory.remotePos?.x,
                creep.memory.remotePos?.y
            );
        } else {
            //should run once on creation, if value is missed when spawned
            if (!creep.memory.homeRoom) {
                creep.memory.homeRoom = creep.room.name
            }

            if (creep.memory.targetRoom === creep.room.name) {

                if (!creep.room.memory.remoteSources) {
                    var nextRoom = addRemoteRoomsToMemory(creep.room, creep.memory.ScoutDirection!);
                    if (!nextRoom) {
                      Game.notify("Scouter couldn't find another room to go to " + creep.name)
                    } else {
                      
                      var roomDistance = Game.map.getRoomLinearDistance(creep.memory.homeRoom, nextRoom);
                      if (roomDistance > 5) {
                        creep.room.memory.maxRoomDistanceReached = true;
                      } else {
                        creep.memory.targetRoom = nextRoom;
                      }
                    }
                }

            }
        }

        //     var knownRoomsWithoutScout = _.filter(Memory.rooms, (room) => !room.scoutVisited);

        //     if (!creep.memory.homeRoom) {
        //         creep.memory.homeRoom = creep.room.name
        //     }

        //     if (creep.memory.targetRoom == creep.room.name) {
        //     var homeRoomRemotes = _.filter(Memory.rooms[creep.memory.homeRoom].remoteSources!, (remote) => remote.roomName === creep.room.name);

        //     if (homeRoomRemotes.length === 0) {

        //         var substrings = ['']// friendly players

        //         var enemyInRoom = creep.room.find(FIND_HOSTILE_CREEPS, {
        //                         filter: (creep) => !substrings.some(v => creep.owner.username.includes(v))
        //                     });

        //         var remoteSource: RemoteSource = {
        //             roomName: creep.room.name,
        //             scoutVisited: true,
        //             avoidRoom: shouldAvoid.length > 0,
        //             does

        //         }
        //         Memory.rooms[creep.memory.homeRoom].remoteSources?.push()
        //     }
        //     }

        //     var substrings = ['']// friendly players

        //     if (creep.memory.targetRoom === creep.room.name) {
        //         var mainRoom = Memory.rooms[creep.memory.mainRoom!]
        //         var mainRoomRemote = _.find(mainRoom.remoteSources!, (remote) => remote.roomName === creep.room.name);
        //         mainRoomRemote!.avoidRoom = creep.room.find(FIND_HOSTILE_CREEPS, {
        //             filter: (creep) => creep.owner.username != 'Invader' || !substrings.some(v => creep.owner.username.includes(v))
        //         }).length > 0
        //         delete creep.memory.targetRoom;
        //         creep.room.memory.avoidRoom = mainRoomRemote!.avoidRoom
        //         creep.room.memory.scoutVisited = true;
        //     }

        //     if (creep.memory.targetRoom && creep.memory.roomsToScout?.length! == 0) {
        //         creep.memory.roomsToScout = _.map(_.filter(creep.room.memory.remoteSources!, (remote) => !remote.scoutVisited), (source) => source.roomName!);


        //     } else if (creep.memory.roomsToScout?.length! > 0) {
        //         creep.memory.targetRoom = creep.memory.roomsToScout![0];
        //         _.remove(creep.memory.roomsToScout!, (room) => room === creep.memory.roomsToScout![0]);
        //     }  else {
        //         var unVisitedRooms = _.filter(
        //             Memory.rooms,
        //             (room) => !room.scoutVisited
        //         );
        //         if (unVisitedRooms.length > 0) {
        //             creep.memory.targetRoom = _.findKey(unVisitedRooms[0]);
        //             creep.memory.mainRoom = _.findKey(unVisitedRooms[0]);
        //         }
        //     }
        // }
    },
};

export { roleScout };
