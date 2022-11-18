import _ from "lodash";

var roleFiller = {
  /** @param {Creep} creep **/
  run: function (creep: Creep) {
    if (!creep.memory.working && creep.store.getUsedCapacity() == 0) {
      creep.memory.working = true;
      creep.say("🔄 withdraw");
    }
    if (creep.memory.working && creep.store.getFreeCapacity() == 0) {
      creep.memory.working = false;
      creep.say("⚡ transfer");
    }

    var targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (
          ((structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
          ((structure.structureType == STRUCTURE_CONTAINER ||
            structure.structureType == STRUCTURE_STORAGE) &&
            structure.store.getUsedCapacity() != 0) ||
            (structure.structureType == STRUCTURE_TERMINAL)
        );
      },
    });

    if (creep.memory.working) {
      var containers = _.filter(
        targets,
        (target) =>
          target.structureType == STRUCTURE_CONTAINER ||
          target.structureType == STRUCTURE_STORAGE
      );
      if (containers.length > 0) {
        var container = creep.pos.findClosestByRange(containers);
        if (container) {
          if (creep.pos.isNearTo(container)) {

            if (container instanceof StructureContainer || container instanceof StructureStorage
              && _.find(targets, (structure) => structure.structureType == STRUCTURE_TERMINAL)) {
              var otherResources = _.filter(_.keys(container.store), (store) => store != RESOURCE_ENERGY);
              if (otherResources.length > 0) {
                creep.withdraw(container, otherResources[0] as ResourceConstant)
                return;
              }
            }

            creep.withdraw(container, RESOURCE_ENERGY);
          } else {
            creep.travelTo(container);
          }
        }
      }
    } else {
      var structures = _.filter(
        targets,
        (structure) =>
          structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN ||
          structure.structureType == STRUCTURE_TERMINAL
      );

      if (_.findKey(creep.store) != RESOURCE_ENERGY) {
        var terminal = _.find(structures, (structure) => structure.structureType == STRUCTURE_TERMINAL)
        if (terminal) {
          if (creep.pos.isNearTo(terminal)) {
            creep.transfer(terminal, _.findKey(creep.store) as ResourceConstant);
          } else {
            creep.travelTo(terminal);
          }
          return;
        }
      }

      _.remove(structures, (structure) => structure.structureType == STRUCTURE_TERMINAL && structure.store[RESOURCE_ENERGY] >= 2000)

      if (structures.length > 0) {

        var structure = creep.pos.findClosestByRange(structures);
        if (structure) {
          if (creep.pos.isNearTo(structure)) {
            creep.transfer(structure, RESOURCE_ENERGY);
          } else {
            creep.travelTo(structure);
          }
        }
      } else {
        if (!creep.pos.isNearTo(Game.flags[creep.memory.homeRoom+"Flag1"])) {
            creep.travelTo(Game.flags[creep.memory.homeRoom+"Flag1"]);
            creep.say("🤡 idle");
          } else {
            return;
          }
      }
    }
  },
};

export { roleFiller };
