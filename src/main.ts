import { roleHarvester } from "./role.harvester";
import { roleUpgrader } from "./role.upgrader";
import { roleBuilder } from "./role.builder";
import { roleMiner } from "./role.miner";
import { roleRepair } from "./role.repair";
import "traveler";
import { roleRemoteMiner } from "./role.remote.miner";
import { roleRemoteTransport } from "role.remote.transport";
import { roleRemoteClaimer } from "role.remote.claimer";
import { roleDefender } from "role.defender";
import { roomSpawn } from "room.spawn";
import { roleFiller } from "role.filler";
import { roleExtractor } from "role.extractor";
import { roleHealer } from "role.healer";
import { roleRoomClaimer } from "role.room.claimer";
import { roleRoomUpgrader } from "role.room.upgrader";
import _ from "lodash";
// import { preTick, reconcileTraffic } from "screeps-cartographer";

declare global {
  /*
      Example types, expand on these or remove them and add your own.
      Note: Values, properties defined here do no fully *exist* by this type definiton alone.
            You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)
  
      Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
      Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
    */
  // Memory extension samples
  interface Memory {
    empire: HostileRooms;
    uuid: number;
    log: any;
  }

  interface HostileRooms {
    hostileRooms?: Room[];
  }

  interface RoomMemory {
    avoid?: number;
    avoidRoom?: boolean;
    resources?: {
      energy: { id: Id<Source>; beingMined?: boolean; beingMinedBy?: string }[];
    };
    remoteSources?: RemoteSource[];
    constructionSites?: ConstructData[];
    buildingToBeRepaired?: StructureData[];
    extractors?: StructureData[];
    underAttack?: boolean;
    scoutVisited?: boolean;
    mineralRegenTime?: number;
    maxRoomDistanceReached?: boolean;
    hasOwnSpawner?: boolean;
    remoteRooms?: RemoteRoom[];
    // spawn_pos: RoomPosition;
  }

  interface StructureData {
    id: Id<AnyStructure>;
    hits: number;
    hitsMax: number;
    beingRepaired: boolean;
  }

  interface ConstructData {
    id: Id<ConstructionSite<BuildableStructureConstant>>;
    progress: number;
    progressTotal: number;
  }

  interface RemoteSource {
    roomName?: string;
    sourcePos?: RoomPosition;
    lastSpawnTime?: number;
    sourceId?: Id<Source>;
    // depricate this
    roomsAvailable?: boolean;
    avoidRoom?: boolean;
    hasMiner?: boolean;
    hasClaimer?: boolean;
    transporterCount?: number;
    transporterLimit?: number;
    scoutVisited?: boolean;
  }

  interface RemoteRoom {
    roomName: string;
    hasBeenClaimed: boolean;
  }

  interface RoomTerrain {
    getRawBuffer(): Uint8Array;
  }

  interface CreepMemory {
    role: string;
    room?: Room;
    working?: boolean;
    upgrading?: boolean;
    building?: boolean;
    extracting?: boolean;
    harvestPointId?: Id<_HasId>;
    sourceId?: Id<Source>;
    droppedEnergyId?: Id<Resource>;
    structureBeingRepaired?: Id<AnyStructure>;
    structureToBuild?: Id<ConstructionSite>;
    depositId?: Id<Mineral<MineralConstant>>;
    mineralType?: MineralConstant;
    homeRoom: string;
    targetRoom?: string;
    mainRoom?: string;
    remotePos?: RoomPosition;
    justPickup?: boolean;
    roomsToScout?: string[];
    ScoutDirection?: TOP | RIGHT | BOTTOM | LEFT;
    spawnToRecycleId?: Id<StructureSpawn>;
    withdrawWait?: number;
    _m?: TravelData[];
    _t?: any;
    _trav?: any;
  }

  interface Creep {
    _offRoadTime: number;
    _moveTime: number;
    _canMove: boolean;
    originalMoveTo: any;
    moveOffRoad: (target?: Creep, defaultOptions?: {}) => boolean | -4;
    moveToRoom: (roomName: any, options?: MoveToOpts) => any;
    move(target: Creep | number): number;
    travelTo(
      destination: RoomPosition | { pos: RoomPosition },
      options?: TravelToOptions
    ): number;
  }

  interface PowerCreep {
    originalMoveTo: any;
    moveToRoom: any;
  }

  interface FindPathOpts {
    offRoads?: any;
    routeCallback?: any;
    findRoute?: boolean;
    avoidRooms?: any[];
    ignoreStructures?: boolean;
    ignoreTunnels?: boolean;
    ignoreContainers?: boolean;
    containerCost?: number;
  }

  interface MoveToOpts {
    priority?: number;
    moveOffExit?: boolean;
    moveOffRoad?: boolean;
  }

  interface CostMatrix {
    setFast(x: number, y: number, cost: number): void;
  }

  class RoomPositionExtra implements RoomPosition {
    prototype: RoomPosition;
    roomName: string;
    x: number;
    y: number;
    createConstructionSite(
      structureType: BuildableStructureConstant
    ): ScreepsReturnCode;
    createConstructionSite(
      structureType: "spawn",
      name?: string | undefined
    ): ScreepsReturnCode;
    createFlag(
      name?: string | undefined,
      color?: ColorConstant | undefined,
      secondaryColor?: ColorConstant | undefined
    ): string | -3 | -10;
    findClosestByPath<K extends FindConstant, S extends FindTypes[K]>(
      type: K,
      opts?:
        | (FindPathOpts &
            Partial<FilterOptions<K, S>> & {
              algorithm?: FindClosestByPathAlgorithm | undefined;
            })
        | undefined
    ): S | null;
    findClosestByPath<S extends AnyStructure>(
      type: 107 | 108 | 109,
      opts?:
        | (FindPathOpts &
            Partial<FilterOptions<107, S>> & {
              algorithm?: FindClosestByPathAlgorithm | undefined;
            })
        | undefined
    ): S | null;
    findClosestByPath<T extends RoomPosition | _HasRoomPosition>(
      objects: T[],
      opts?:
        | (FindPathOpts & {
            filter?:
              | string
              | FilterObject
              | ((object: T) => boolean)
              | undefined;
            algorithm?: FindClosestByPathAlgorithm | undefined;
          })
        | undefined
    ): T | null;
    findClosestByRange<K extends FindConstant, S extends FindTypes[K]>(
      type: K,
      opts?: FilterOptions<K, S> | undefined
    ): S | null;
    findClosestByRange<S extends AnyStructure>(
      type: 107 | 108 | 109,
      opts?: FilterOptions<107, S> | undefined
    ): S | null;
    findClosestByRange<T extends RoomPosition | _HasRoomPosition>(
      objects: T[],
      opts?: { filter: any } | undefined
    ): T | null;
    findInRange<K extends FindConstant, S extends FindTypes[K]>(
      type: K,
      range: number,
      opts?: FilterOptions<K, S> | undefined
    ): S[];
    findInRange<S extends AnyStructure>(
      type: 107 | 108 | 109,
      range: number,
      opts?: FilterOptions<107, S> | undefined
    ): S[];
    findInRange<T extends RoomPosition | _HasRoomPosition>(
      objects: T[],
      range: number,
      opts?: { filter?: any } | undefined
    ): T[];
    findPathTo(
      x: number,
      y: number,
      opts?: FindPathOpts | undefined
    ): PathStep[];
    findPathTo(
      target: RoomPosition | _HasRoomPosition,
      opts?: FindPathOpts | undefined
    ): PathStep[];
    getDirectionTo(x: number, y: number): DirectionConstant;
    getDirectionTo(target: RoomPosition | _HasRoomPosition): DirectionConstant;
    getRangeTo(x: number, y: number): number;
    getRangeTo(target: RoomPosition | { pos: RoomPosition }): number;
    inRangeTo(x: number, y: number, range: number): boolean;
    inRangeTo(
      target: RoomPosition | { pos: RoomPosition },
      range: number
    ): boolean;
    isEqualTo(x: number, y: number): boolean;
    isEqualTo(target: RoomPosition | { pos: RoomPosition }): boolean;
    isNearTo(x: number, y: number): boolean;
    isNearTo(target: RoomPosition | { pos: RoomPosition }): boolean;
    look(): LookAtResult<LookConstant>[];
    lookFor<T extends keyof AllLookAtTypes>(type: T): AllLookAtTypes[T][];
    getOpenPositions(): RoomPosition[];
    getNearbyPositions(): RoomPosition[];
    __packedPos: number;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
      purge: Function;
      Memory?: Memory;
    }
  }
  type HasPos = { pos: RoomPosition };

  interface RawMemory {
    _parsed: Memory;
  }

  var canBuildExtentions: boolean;
  var lastMemoryTick: number | undefined;
  var LastMemory: Memory;
}

(RoomPosition.prototype as RoomPositionExtra).getNearbyPositions =
  function getNearbyPositions() {
    var positions = [];
    let startX = this.x - 1 || 1;
    let startY = this.y - 1 || 1;
    for (let x = startX; x <= this.x + 1 && x < 49; x++) {
      for (let y = startY; y <= this.y + 1 && y < 49; y++) {
        if (x !== this.x || y !== this.y) {
          positions.push(new RoomPosition(x, y, this.roomName));
        }
      }
    }
    return positions;
  };

(RoomPosition.prototype as RoomPositionExtra).getOpenPositions =
  function getOpenPositions() {
    let nearbyPositions = this.getNearbyPositions();
    let terrain = Game.map.getRoomTerrain(this.roomName);
    let walkablePositions = _.filter(nearbyPositions, function (pos) {
      var test = _.filter(
        pos.lookFor(LOOK_STRUCTURES),
        (structure) => structure.structureType === STRUCTURE_ROAD
      )[0];
      if (test) {
        return true;
      }
      return terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL;
    });

    var ignoreMe = new RoomPosition(27, 12, this.roomName);

    let freepositions = _.filter(walkablePositions, function (pos) {
      return (
        !pos.lookFor(LOOK_CREEPS).length &&
        pos.x !== ignoreMe.x &&
        pos.y !== ignoreMe.y
      );
    });
    return freepositions;
  };

// function isEnterable(pos: RoomPosition) {
//   return _.every(pos.look(), item =>
//       item.type === 'terrain' ?
//       item.terrain !== 'wall' :
//       !isObstacle[item.structureType]
//   );
// }

function remoteSourcesMemoryManagement(creepMemory: CreepMemory) {
  if (Memory.rooms[creepMemory.homeRoom]) {
    return _.find(Memory.rooms[creepMemory.homeRoom].remoteSources!, (source) => {
      return source.roomName === creepMemory.targetRoom;
    });
  }
  return null;
}

global.canBuildExtentions = true;

global.lastMemoryTick = undefined;

function tryInitSameMemory() {
  if (lastMemoryTick && global.LastMemory && Game.time == lastMemoryTick + 1) {
    delete global.Memory;
    global.Memory = global.LastMemory;
    RawMemory._parsed = global.LastMemory;
  } else {
    Memory;
    global.LastMemory = RawMemory._parsed;
  }
  lastMemoryTick = Game.time;
}

export const loop = () => {
  // preTick();
  try {
    tryInitSameMemory();
    for (var name in Memory.creeps) {
      if (!Game.creeps[name]) {
        var creepMemory = Memory.creeps[name];

        if (creepMemory.role === "miner") {
          var memory = _.find(
            Memory.rooms[creepMemory.homeRoom].resources?.energy!,
            (source) => source.beingMinedBy === name
          );
          if (memory) {
            memory.beingMined = false;
            memory.beingMinedBy = "";
          }
        }

        if (name.includes("remote")) {
          var remoteSource = remoteSourcesMemoryManagement(creepMemory);

          if (remoteSource) {
            if (name.includes("remoteMiner")) {
              remoteSourcesMemoryManagement(creepMemory);
              remoteSource!.hasMiner = false;
              remoteSource!.lastSpawnTime = Game.time;
              var supposedToDie = remoteSource.lastSpawnTime;
              if (supposedToDie && supposedToDie >= Game.time) {
                remoteSource.lastSpawnTime = 0;
              }
            }
            if (name.includes("remoteTransporter")) {
              remoteSource!.transporterCount!--;
            }
            if (name.includes("remoteClaimer")) {
              remoteSource!.hasClaimer = false;
            }
          }
        }
        delete Memory.creeps[name];
        console.log("Clearing non-existing creep memory:", name);
      }
    }

    roomSpawn();

    for (var name in Game.creeps) {
      var creep = Game.creeps[name];
      switch (creep.memory.role) {
        case "harvester":
          roleHarvester.run(creep);
          break;
        case "upgrader":
          roleUpgrader.run(creep);
          break;
        case "builder":
          roleBuilder.run(creep);
          break;
        case "miner":
          roleMiner.run(creep);
          break;
        case "repair":
          roleRepair.run(creep);
          break;
        case "remoteMiner":
          roleRemoteMiner.run(creep);
          break;
        case "remoteTransporter":
          roleRemoteTransport.run(creep);
          break;
        case "remoteClaimer":
          roleRemoteClaimer.run(creep);
          break;
        case "defender":
          roleDefender.run(creep);
          break;
        case "filler":
          roleFiller.run(creep);
          break;
        case "extractor":
          roleExtractor.run(creep);
          break;
        case "healer":
          roleHealer.run(creep);
          break;
        case "remoteRoomClaimer":
          roleRoomClaimer.run(creep);
          break;
        case "remoteRoomUpgrader":
          roleRoomUpgrader.run(creep);
          break;
      }
    }

    var cpuInBucket = Game.cpu.bucket;
    console.log("cpuInBucket", cpuInBucket);
    if (cpuInBucket === 10000) {
      Game.cpu.generatePixel();
    }

  } catch (e: any) {
    console.log(e.stack);
  }
  // reconcileTraffic();

  // Pathing.runMoves();
};
