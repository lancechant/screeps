import _ from "lodash";

export function createBody(segments: Array<BodyPartConstant>, room: Room, maxAmountOfSegments?: number) {
  let body: BodyPartConstant[] = [];

  let segmentCost = _.sum(segments, (s) => BODYPART_COST[s]);

  let energyAvailable = room.energyAvailable;

  let maxSegments = Math.floor(energyAvailable / segmentCost);

  // let mediumSegments = Math.round(maxSegments / 2); to test

  if (maxAmountOfSegments && maxSegments > maxAmountOfSegments) {
    maxSegments = maxAmountOfSegments;
  }

  _.times(maxSegments, () => _.forEach(segments, (s) => body.push(s)));

  return body;
}

export function calculateMaxSegments(room: Room, minWantedSegments: number, maxWantedSegments: number) {
  switch(room.controller?.level!) {
    case 1:
      return minWantedSegments;
    case 2:
      return maxSizeCheck(minWantedSegments, room.controller?.level!, maxWantedSegments);
    case 3:
      return maxSizeCheck(minWantedSegments, room.controller?.level!, maxWantedSegments);
    case 4:
      return maxSizeCheck(minWantedSegments, room.controller?.level!, maxWantedSegments);
    case 5:
      return maxSizeCheck(minWantedSegments, room.controller?.level!, maxWantedSegments);
    case 6:
      return maxSizeCheck(minWantedSegments, room.controller?.level!, maxWantedSegments);
    case 7:
      return maxSizeCheck(minWantedSegments, room.controller?.level!, maxWantedSegments);
    case 8:
      return maxSizeCheck(minWantedSegments, room.controller?.level!, maxWantedSegments);
    default:
      throw new Error('Controller level not found or not catered for');
  }
}

function maxSizeCheck(minWantedSegments: number, controllerLevel: number, maxWantedSegments: number) {
  return minWantedSegments + controllerLevel > maxWantedSegments ? maxWantedSegments : Math.round(minWantedSegments + controllerLevel / 2);
}

export function addSourcesToMemory(room: Room) {
  let sources = room.find(FIND_SOURCES);
  if (
    room.memory.resources &&
    room.memory.resources.energy.length === sources.length
  ) {
    return;
  }
  room.memory.resources = { energy: [] };
  _.forEach(sources, (source) => {
    room.memory.resources!.energy.push({ id: source.id });
    // let data = _.get(room.memory, ['resources', 'energy']);
    // if (data === undefined) {
    //   _.set(room.memory, ['resources', 'energy'], source.id)
    // }
  });
}

export function addRemoteRoomsToMemory(room: Room) {
  const remoteRoomNames = Object.values(
    Game.map.describeExits(room.name) || {}
  );
  // const remoteRoomNames = ['sim2'];
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

  _.forEach(remoteRoomNames, (remoteRoom) => {

    if (room.name.includes("0")) {
      room.memory.remoteSources?.push({
        roomName: remoteRoom,
        avoidRoom: true
      });
      return;
    }

    if (remoteRoom && !knownRooms[remoteRoom]) {
      room.memory.remoteSources?.push({
        roomName: remoteRoom,
        roomsAvailable: remoteRoomNames.length > 0,
        transporterLimit: 2,
      });
    }
  });
  // remoteRooms: {
  // {roomName: 'Evvv', sourceids: [{id: 'asdsadas', lastSpawnTime: 123123}]}
  // }
}

export function addConstructionSitesForRoom(room: Room) {
  if (Game.time % 15 === 0 || (!room.memory.constructionSites || room.memory.constructionSites.length == 0)) {
    room.memory.constructionSites = room
      .find(FIND_MY_CONSTRUCTION_SITES)
      .map((t) => {
        return {
          id: t.id,
          progress: t.progress,
          progressTotal: t.progressTotal,
        } as ConstructData;
      });
  }
}
