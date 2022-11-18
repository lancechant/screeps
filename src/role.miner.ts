import { harvestEnergy } from "creepFunctions";

var roleMiner = {
  /** @param {Creep} creep **/
  run: function (creep: Creep) {
      harvestEnergy(creep, true);
  },
};

export { roleMiner };
