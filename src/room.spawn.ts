import _, { isArray } from "lodash";
import { roomDefense } from "room.defense";
import {
  addSourcesToMemory,
  addRemoteRoomsToMemory,
  createBody,
  addConstructionSitesForRoom,
} from "room.functions";
import { roomTerminal } from "room.terminal";

export function roomSpawn() {
  _.forEach(Game.rooms, (room) => {
    if (!room.memory.resources && !room.name.includes("0")) {
      addSourcesToMemory(room);
    }

    if (!room.memory.remoteSources && !room.name.includes("0")) {
      addRemoteRoomsToMemory(room);
    }

    // if (!room.memory.spawn_pos) {
    //   room.memory.spawn_pos = room.find(FIND_MY_SPAWNS)[0].pos
    // }

    roomDefense(room);
    roomTerminal(room);
    if (!room.name.includes("0")) {
      addConstructionSitesForRoom(room);
    }

    // let spawns = room.find(FIND_MY_SPAWNS, {
    //   filter: (spawn) => spawn.spawning == null
    // })

    if (!room.memory.hasOwnSpawner && room.controller?.my) {
      room.memory.hasOwnSpawner = room.find(FIND_MY_SPAWNS).length > 0;
    }

    let spawns = _.filter(Game.spawns, (spawn) => spawn.spawning == null && spawn.room.name === room.name)

    if (spawns.length == 0) {
      return;
    }
    // early break if spawn just finished spawning, i.e OK return

    setIdleFlagDestination(room);

    var harvestersConstructed = createHarvesters(room, spawns[0]);

    var minersConstructed = createLocalMiners(room, harvestersConstructed, spawns[0]);

    var canCreateCreep = harvestersConstructed && minersConstructed;

    canCreateCreep = createDefender(room, canCreateCreep, spawns[0]);
    
    canCreateCreep = createHealers(room, canCreateCreep, spawns[0]);

    canCreateCreep = createRoomClaimer(room, canCreateCreep, spawns[0]);

    canCreateCreep = createRemoteRoomClaimer(room, canCreateCreep, spawns[0]);

    canCreateCreep = createUpgraders(room, canCreateCreep, spawns[0]);

    canCreateCreep = createRepairs(room, canCreateCreep, spawns[0]);

    canCreateCreep = createBuilders(room, canCreateCreep, spawns[0]);

    canCreateCreep = createFillers(room, canCreateCreep, spawns[0]);

    canCreateCreep = createExtractors(room, canCreateCreep, spawns[0]);

    createRemoteCreeps(room, canCreateCreep, spawns[0]);

    if (spawns[0].spawning) {
      var spawningCreep = Game.creeps[spawns[0].spawning.name];
      spawns[0].room.visual.text(
        "🛠️" + spawningCreep.memory.role,
        spawns[0].pos.x + 1,
        spawns[0].pos.y,
        { align: "left", opacity: 0.8 }
      );
    }

    // createExtensions(room);
  });
}

function setIdleFlagDestination(room: Room) {
  if (room && room.controller && room.controller.my) {
    if (room.find(FIND_FLAGS).length == 0) {
      const roomSpawn = _.filter(
        Game.spawns,
        (spawn) => spawn.room.name === room.name
      )[0];
      room.createFlag(roomSpawn.pos.x + 5, roomSpawn.pos.y + 5, room.name + "Flag1");
    }
  }
}

function createHarvesters(room: Room, spawn: StructureSpawn) {
  let harvesterPopulation = _.get(room.memory, ["population", "harvester"], 3);

  var harvesters = _.filter(
    Game.creeps,
    (creep) => creep.memory.role == "harvester" && creep.memory.homeRoom === room.name
  );
  console.log("Harvesters: " + harvesters.length);

  if (harvesters.length < harvesterPopulation && room.energyAvailable >= 250) {

    var body;
    var miners = _.filter(Game.creeps, (creep) => creep.memory.role == "miner" && creep.memory.homeRoom === room.name);
    if (miners.length == 0) {
      body = [WORK, CARRY, MOVE, MOVE];
    } else {
      body = [CARRY, CARRY, MOVE, MOVE];
    }

    var newName = "Harvester" + Game.time;
    console.log("Spawning new harvester: " + newName);
    var results = spawn.spawnCreep(
      createBody(body, room, 3),
      newName,
      {
        memory: { role: "harvester", homeRoom: room.name, justPickup: miners.length > 0 },
      }
    );
    if (results == OK) {
      return false;
    }
  }
  return harvesters.length >= harvesterPopulation;
}

function createLocalMiners(room: Room, harvestersConstructed: boolean, spawn: StructureSpawn) {
  let minerPopulation = 2;
  if (room.memory.resources && _.isArray(room.memory.resources.energy)) {
    minerPopulation = _.size(room.memory.resources.energy);
  }

  var miners = _.filter(Game.creeps, (creep) => creep.memory.role == "miner" && creep.memory.homeRoom === room.name);
  console.log("miners: " + miners.length);

  if (
    miners.length < minerPopulation &&
    harvestersConstructed &&
    room.energyAvailable >= 250
  ) {
    var newName = "miner" + Game.time;
    console.log("Spawning new miner: " + newName);
    var results = spawn.spawnCreep(
      createBody([WORK, WORK, MOVE], room, 3),
      newName,
      {
        memory: { role: "miner", homeRoom: room.name },
      }
    );
    if (results == OK) {
      return false;
    }
  }
  return miners.length >= minerPopulation || harvestersConstructed;
}

function createUpgraders(room: Room, canCreateCreep: boolean, spawn: StructureSpawn) {
  let upgraderPopulation = _.get(room.memory, ["population", "upgrader"], 4);

  var upgraders = _.filter(
    Game.creeps,
    (creep) => creep.memory.role == "upgrader" && creep.memory.homeRoom === room.name
  );
  console.log("upgraders: " + upgraders.length);

  if (
    upgraders.length < upgraderPopulation &&
    canCreateCreep &&
    room.energyAvailable >= 300
  ) {
    var newName = "upgrader" + Game.time;
    console.log("Spawning new upgrader: " + newName);
    var results = spawn.spawnCreep(
      createBody([WORK, CARRY, CARRY, MOVE, MOVE], room, 7),
      newName,
      {
        memory: { role: "upgrader", homeRoom: room.name },
      }
    );
    if (results == OK) {
      return false;
    }
  }
  return upgraders.length >= upgraderPopulation && canCreateCreep;
}

function createRepairs(room: Room, canCreateCreep: boolean, spawn: StructureSpawn) {
  let repairPopulation = _.get(room.memory, ["population", "repair"], 2);

  var repairs = _.filter(Game.creeps, (creep) => creep.memory.role == "repair" && creep.memory.homeRoom === room.name);
  console.log("repairs: " + repairs.length);

  var buildingToBeRepaired = !room.memory.buildingToBeRepaired
    ? []
    : room.memory.buildingToBeRepaired;

  if (buildingToBeRepaired.length == 0 || Game.time % 10 === 0) {
    room.memory.buildingToBeRepaired = room
      .find(FIND_STRUCTURES, {
        filter: (object) =>
          object.hits < object.hitsMax &&
          object.structureType != STRUCTURE_WALL,
      })
      .map((t) => {
        return {
          id: t.id,
          hits: t.hits,
          hitsMax: t.hitsMax,
        } as StructureData;
      });
  }

  if (
    repairs.length < repairPopulation &&
    buildingToBeRepaired.length > 0 &&
    canCreateCreep &&
    room.energyAvailable >= 250
  ) {
    var newName = "repair" + Game.time;
    console.log("Spawning new repairer: " + newName);
    var results = spawn.spawnCreep(
      createBody([WORK, CARRY, MOVE, MOVE], room, 8),
      newName,
      {
        memory: { role: "repair", homeRoom: room.name },
      }
    );
    if (results == OK) {
      return false;
    }
  }
  return (
    (repairs.length >= repairPopulation || buildingToBeRepaired.length == 0) &&
    canCreateCreep
  );
}

function createBuilders(room: Room, canCreateCreep: boolean, spawn: StructureSpawn) {
  let builderPopulation = _.get(room.memory, ["population", "builder"], 3);

  var builders = _.filter(
    Game.creeps,
    (creep) => creep.memory.role == "builder" && creep.memory.homeRoom === room.name
  );
  console.log("builders: " + builders.length);

  // if (!room.memory.constructionSites) {
  //   room.memory.constructionSites = [];
  // }

  // if (room.memory.constructionSites.length === 0 ||
  //   Game.time % 10 === 0) {
  //   room.memory.constructionSites = room
  //     .find(FIND_CONSTRUCTION_SITES)
  //     .map((t) => {
  //       return {
  //         id: t.id,
  //         progress: t.progress,
  //         progressTotal: t.progressTotal,
  //       } as ConstructData;
  //     });
  // }

  var roomWithConstruction;
  for (var key in Memory.rooms) {

    if (!Memory.rooms[key].constructionSites) {
      Memory.rooms[key].constructionSites = []
    }

    if (Memory.rooms[key].constructionSites && Memory.rooms[key].constructionSites!.length > 0) {
      if (key !== room.name && Memory.rooms[key].hasOwnSpawner) {
        continue;
      }
      roomWithConstruction = key;
      break;
    }
  }

  if (
    builders.length < builderPopulation &&
    roomWithConstruction &&
    canCreateCreep &&
    room.energyAvailable >= 250
  ) {
    var newName = "builder" + Game.time;
    console.log("Spawning new builder: " + newName);
    var results = spawn.spawnCreep(
      createBody([WORK, CARRY, MOVE, MOVE], room, 8),
      newName,
      {
        memory: { role: "builder", homeRoom: room.name, targetRoom: roomWithConstruction },
      }
    );
    if (results == OK) {
      return false;
    }
  }
  return (
    (builders.length >= builderPopulation ||
      room.memory.constructionSites!.length == 0) &&
    canCreateCreep
  );
}

function createDefender(room: Room, canCreateCreep: boolean, spawn: StructureSpawn) {
  let defenderPopulation = _.get(room.memory, ["population", "defender"], 1);

  var defenders = _.filter(
    Game.creeps,
    (creep) => creep.memory.role === "defender" && creep.memory.homeRoom === room.name
  );
  console.log("defenders: " + defenders.length);

  var underAttack;
  for (var key in Memory.rooms) {
    if (Memory.rooms[key].underAttack) {
      underAttack = key;
      break;
    }
  }

  if (
    defenders.length < defenderPopulation &&
    underAttack &&
    room.energyAvailable >= 450
  ) {
    var newName = "defender" + Game.time;
    console.log("Spawning new defender: " + newName);

    var results = spawn.spawnCreep(
      createBody([TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, ATTACK], room, 3),
      newName,
      {
        memory: {
          role: "defender",
          homeRoom: spawn.room.name,
          targetRoom: underAttack,
        },
      }
    );
    if (results == OK) {
      return false;
    }
  }
  return (
    (defenders.length >= defenderPopulation || !underAttack) && canCreateCreep
  );
}

function createHealers(room: Room, canCreateCreep: boolean, spawn: StructureSpawn) {
  let healerPopulation = _.get(room.memory, ["population", "healer"], 1);

  var healers = _.filter(
    Game.creeps,
    (creep) => creep.memory.role === "healer" && creep.memory.homeRoom === room.name
  );
  console.log("healers: " + healers.length);

  var defenders = _.filter(
    Game.creeps,
    (creep) => creep.memory.role === "defender" && creep.memory.homeRoom === room.name)

  var underAttack;
  for (var key in Memory.rooms) {
    if (Memory.rooms[key].underAttack) {
      underAttack = key;
      break;
    }
  }

  if (
    healers.length < healerPopulation &&
    defenders.length > 0 &&
    underAttack &&
    room.energyAvailable >= 300
  ) {
    var newName = "healer" + Game.time;
    console.log("Spawning new healer: " + newName);

    var results = spawn.spawnCreep(
      createBody([MOVE, HEAL], room, 9),
      newName,
      {
        memory: {
          role: "healer",
          homeRoom: spawn.room.name,
          targetRoom: underAttack,
        },
      }
    );
    if (results == OK) {
      return false;
    }
  }
  return (
    (healers.length >= healerPopulation || !underAttack) && canCreateCreep
  );
}

function createRoomClaimer(room: Room, canCreateCreep: boolean, spawn: StructureSpawn) {
  let remoteRoomClaimerPopulation = _.get(room.memory, ["population", "remoteRoomClaimer"], 1);

  var remoteRoomClaimer = _.filter(
    Game.creeps,
    (creep) => creep.memory.role == "remoteRoomClaimer" && creep.memory.homeRoom === room.name
  );
  console.log("remoteRoomClaimers: " + remoteRoomClaimer.length);

  var remoteRoom: RemoteRoom | undefined;

  if (room.memory.remoteRooms) {
    remoteRoom = _.find(room.memory.remoteRooms, (room) => !room.hasBeenClaimed)
  }

  if (
    remoteRoomClaimer.length < remoteRoomClaimerPopulation &&
    remoteRoom && !remoteRoom.hasBeenClaimed &&
    canCreateCreep &&
    room.energyAvailable >= 950
  ) {
    var newName = "remoteRoomClaimer" + Game.time;
    console.log("Spawning new remoteRoomClaimer: " + newName);
    var results = spawn.spawnCreep(
      createBody([CLAIM, WORK, WORK, MOVE, MOVE, MOVE], room, 1),
      newName,
      {
        memory: { role: "remoteRoomClaimer", homeRoom: room.name, targetRoom: remoteRoom.roomName },
      }
    );
    if (results == OK) {
      return false;
    }
  }
  return (
    (remoteRoomClaimer.length >= remoteRoomClaimerPopulation ||
      !remoteRoom) &&
    canCreateCreep
  );
}

function createRemoteRoomClaimer(room: Room, canCreateCreep: boolean, spawn: StructureSpawn) {
  let remoteRoomUpgraderPopulation = _.get(room.memory, ["population", "remoteRoomUpgrader"], 1);

  var remoteRoomUpgraders = _.filter(
    Game.creeps,
    (creep) => creep.memory.role == "remoteRoomUpgrader" && creep.memory.homeRoom === room.name
  );
  console.log("remoteRoomUpgraders: " + remoteRoomUpgraders.length);

  var roomWithControllerToUpgrade;
  for (var key in Memory.rooms) {
    if (Memory.rooms[key].constructionSites && Memory.rooms[key].constructionSites!.length > 0) {
      if (key !== room.name || Memory.rooms[key].hasOwnSpawner) {
        continue;
      }
      roomWithControllerToUpgrade = key;
      break;
    }
  }

  if (
    remoteRoomUpgraders.length < remoteRoomUpgraderPopulation &&
    roomWithControllerToUpgrade &&
    canCreateCreep &&
    room.energyAvailable >= 250
  ) {
    var newName = "remoteRoomUpgrader" + Game.time;
    console.log("Spawning new remoteRoomUpgrader: " + newName);
    var results = spawn.spawnCreep(
      createBody([WORK, CARRY, MOVE, MOVE], room, 3),
      newName,
      {
        memory: { role: "remoteRoomUpgrader", homeRoom: room.name, targetRoom: roomWithControllerToUpgrade },
      }
    );
    if (results == OK) {
      return false;
    }
  }
  return (
    (remoteRoomUpgraders.length >= remoteRoomUpgraderPopulation ||
      !roomWithControllerToUpgrade) &&
    canCreateCreep
  );
}

function createRemoteMiners(room: Room, canCreateCreep: boolean, spawn: StructureSpawn) {
  let remoteMinerPopulation = _.get(
    room.memory,
    ["population", "remoteMiner"],
    2
  );

  var remoteMiners = _.filter(
    Game.creeps,
    (creep) => creep.memory.role == "remoteMiner" && creep.memory.homeRoom === room.name
  );
  console.log("remoteMiners: " + remoteMiners.length);

  if (remoteMiners.length < remoteMinerPopulation) {
    var canCreateRemoteMiner = _.filter(
      room.memory.remoteSources!,
      (source) => {
        if (source.avoidRoom) {
          return false;
        } else {
          return (
            Game.time - (source.lastSpawnTime || 0) > CREEP_LIFE_TIME &&
            !source.hasMiner &&
            source.roomName
          );
        }
      }
    );
    if (
      canCreateRemoteMiner.length > 0 &&
      canCreateCreep &&
      room.energyAvailable >= 300
    ) {
      var newName = "remoteMiner" + Game.time;
      var remoteSource = canCreateRemoteMiner[0];
      console.log("Spawning new remoteMiner: " + newName);
      var result = spawn.spawnCreep(
        createBody([WORK, WORK, MOVE, MOVE], room, 3),
        newName,
        {
          memory: {
            role: "remoteMiner",
            homeRoom: room.name,
            targetRoom: remoteSource.roomName,
            remotePos: remoteSource.sourcePos,
            sourceId: remoteSource.sourceId,
          },
        }
      );
      if (result == OK) {
        remoteSource.lastSpawnTime = Game.time;
        remoteSource.hasMiner = true;
        return false;
      }
    }
  }
  return remoteMiners.length >= 1;
}

function createRemoteTransporter(room: Room, canCreateCreep: boolean, spawn: StructureSpawn) {
  let remoteTransporterPopulation = _.get(
    room.memory,
    ["population", "remoteTransporter"],
    4
  );

  var remoteTransporters = _.filter(
    Game.creeps,
    (creep) => creep.memory.role == "remoteTransporter" && creep.memory.homeRoom === room.name
  );
  console.log("remoteTransporters: " + remoteTransporters.length);

  if (
    remoteTransporters.length < remoteTransporterPopulation &&
    canCreateCreep &&
    room.energyAvailable >= 300
  ) {
    var canCreateRemoteTransporter = _.filter(
      room.memory.remoteSources!,
      (source) => {
        if (source.avoidRoom) {
          return false;
        } else {
          if (!source.transporterCount) {
            source.transporterCount = 0;
          }
          if (!source.transporterLimit) {
            source.transporterLimit = 2;
          }
          return (
            source.hasMiner && source.transporterCount < source.transporterLimit
          );
        }
      }
    );
    if (canCreateRemoteTransporter.length) {
      var newName = "remoteTransporter" + Game.time;
      var remoteSource = canCreateRemoteTransporter[0];
      console.log("Spawning new remoteTransporter: " + newName);
      var result = spawn.spawnCreep(
        createBody([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], room, 5),
        newName,
        {
          memory: {
            role: "remoteTransporter",
            homeRoom: room.name,
            targetRoom: remoteSource.roomName,
            remotePos: remoteSource.sourcePos,
            sourceId: remoteSource.sourceId,
          },
        }
      );
      if (result == OK) {
        if (!remoteSource.transporterCount) {
          remoteSource.transporterCount = 1;
        } else {
          remoteSource.transporterCount++;
        }
        return false;
      }
    }
  }
  return remoteTransporters.length >= 1;
}

function createRemoteClaimer(room: Room, canCreateCreep: boolean, spawn: StructureSpawn) {
  let remoteClaimerPopulation = _.get(
    room.memory,
    ["population", "remoteClaimer"],
    2
  );

  var remoteClaimers = _.filter(
    Game.creeps,
    (creep) => creep.memory.role == "remoteClaimer" && creep.memory.homeRoom === room.name
  );
  console.log("remoteClaimers: " + remoteClaimers.length);

  if (
    remoteClaimers.length < remoteClaimerPopulation &&
    canCreateCreep &&
    room.energyAvailable >= 1300
  ) {
    var canCreateRemoteTransporter = _.filter(
      room.memory.remoteSources!,
      (source) => {
        if (source.avoidRoom) {
          return false;
        } else {
          return source.hasMiner && !source.hasClaimer;
        }
      }
    );
    if (canCreateRemoteTransporter.length) {
      var newName = "remoteClaimer" + Game.time;
      var remoteSource = canCreateRemoteTransporter[0];
      console.log("Spawning new remoteClaimer: " + newName);
      var result = spawn.spawnCreep(
        [CLAIM, CLAIM, MOVE, MOVE],
        newName,
        {
          memory: {
            role: "remoteClaimer",
            homeRoom: room.name,
            targetRoom: remoteSource.roomName,
          },
        }
      );
      if (result == OK) {
        remoteSource.hasClaimer = true;
        return true;
      }
    }
  }
  return remoteClaimers.length >= 1;
}

function createFillers(room: Room, canCreateCreep: boolean, spawn: StructureSpawn) {
  let fillerPopulation = _.get(room.memory, ["population", "filler"], 1);

  var fillers = _.filter(Game.creeps, (creep) => creep.memory.role == "filler" && creep.memory.homeRoom === room.name);
  console.log("fillers: " + fillers.length);

  if (
    fillers.length < fillerPopulation &&
    canCreateCreep &&
    room.energyAvailable >= 200
  ) {
    var newName = "filler" + Game.time;
    console.log("Spawning new filler: " + newName);
    var results = spawn.spawnCreep(
      createBody([CARRY, MOVE], room, 9),
      newName,
      {
        memory: { role: "filler", homeRoom: room.name },
      }
    );
    if (results == OK) {
      return false;
    }
  }
  return fillers.length >= fillerPopulation && canCreateCreep;
}

function createExtensions(room: Room) {
  // let roomLevel = room.controller?.level!;
  // var extentions = targets.filter(
  //   (t) => t.structureType === STRUCTURE_EXTENSION
  // );
  // if (canBuildExtentions) {
  //   canBuildExtentions =
  //     roomLevel >= 2 && roomLevel <= 8 && extentions.length >= 5;
  //   Game.rooms[room.name].createConstructionSite(
  //     (last_extention_spawn_x_pos += 1),
  //     (last_extention_spawn_y_pos += 1),
  //     STRUCTURE_EXTENSION
  //   );
  // }
}

function createRemoteCreeps(room: Room, canCreateCreep: boolean, spawn: StructureSpawn) {
  var remoteHarvesterConstructed = createRemoteMiners(room, canCreateCreep, spawn);

  if (remoteHarvesterConstructed) {
    var remoteTransporterConstructed = createRemoteTransporter(
      room,
      canCreateCreep, spawn
    );
    if (remoteTransporterConstructed) {
      createRemoteClaimer(room, canCreateCreep, spawn);
    }
  }
}

function createExtractors(room: Room, canCreateCreep: boolean, spawn: StructureSpawn): boolean {
  let extractorPopulation = _.get(room.memory, ["population", "extractor"], 1);

  var extractors = _.filter(
    Game.creeps,
    (creep) => creep.memory.role == "extractor" && creep.memory.homeRoom === room.name
  );
  console.log("extractor: " + extractors.length);

  if (room.controller?.level! >= 6 && room.memory.extractors && room.memory.extractors.length === 0 && Game.time % 50 === 0) {
    room.memory.extractors = room
      .find(FIND_STRUCTURES, {
        filter: (structure) => {
          return structure.structureType == STRUCTURE_EXTRACTOR;
        },
      })
      .map((t) => {
        return {
          id: t.id,
          hits: t.hits,
          hitsMax: t.hitsMax,
        } as StructureData;
      });
  }
  var mineralRegened = room.memory.mineralRegenTime && room.memory.mineralRegenTime <= Game.time

  if (
    extractors.length < extractorPopulation &&
    canCreateCreep &&
    room.controller?.level! >= 6 &&
    room.memory.extractors &&
    room.memory.extractors.length > 0 &&
    mineralRegened &&
    room.energyAvailable >= 600
  ) {
    var newName = "extractor" + Game.time;
    console.log("Spawning new extractor: " + newName);
    var results = spawn.spawnCreep(
      createBody([WORK, WORK, CARRY, CARRY, MOVE, MOVE], room, 2),
      newName,
      {
        memory: { role: "extractor", homeRoom: room.name },
      }
    );
    if (results == OK) {
      return false;
    }
  }
  if (room.controller?.level! >= 7) {
    return !mineralRegened || extractors.length >= extractorPopulation && canCreateCreep;
  } else {
    return canCreateCreep;
  }
}
