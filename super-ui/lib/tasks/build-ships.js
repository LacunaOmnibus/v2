import Promise from 'bluebird';
import _ from 'lodash';

import lacuna from '../lacuna';
import log from '../log';
import types from '../types';
import util from '../util';

class BuildShips {
  constructor(options) {
    this.options = options;
  }

  buildShips(colony, sy, quantity) {
    let plural = util.handlePlurality(quantity, this.options.type);
    log.info(`Building ${quantity} ${plural}`);

    if (!this.options.dryRun) {
      return lacuna.buildings.shipyard.buildShips([
        {
          autoselect: 'all',
          body_id: colony.id,
          building_id: sy.id,
          quantity,
          type: this.options.serverType,
        },
      ]);
    }
  }

  getExistingShipsCount(sp) {
    return lacuna.buildings.spaceport
      .viewAllShips([
        sp.id,
        {
          // paging
          no_paging: true,
        },
        {
          // filter
          type: this.options.serverType,
        },
      ])
      .then((result) => {
        return util.int(result.number_of_ships);
      });
  }

  fixQuantity(quantity, sy) {
    if (quantity <= 0) {
      return 0;
    }

    return lacuna.buildings.shipyard.getBuildable([sy.id]).then((result) => {
      let dockSpace = util.int(result.docks_available);
      let queueSpace = util.int(result.build_queue_max) - util.int(result.build_queue_used);

      return _.min([quantity, dockSpace, queueSpace]);
    });
  }

  /*
   * We need to take into account a number of things here:
   * 	1. Space in the Shipyard queue.
   *  2. Number of ships already building in the build queue.
   *  3. Space in the Space Port.
   *  4. If `this.options.topoff` is true, the number of existing ships.
   */
  determineToBuild(quantity, sy, sp) {
    if (this.options.topoff) {
      return this.getExistingShipsCount(sp).then((existing) => {
        return this.fixQuantity(this.options.quantity - existing, sy);
      });
    } else {
      return this.fixQuantity(this.options.quantity, sy);
    }
  }

  findShipBuildings(colony, buildings) {
    return new Promise((resolve, reject) => {
      Promise.join(
        lacuna.body.findBuilding(buildings, 'Shipyard'),
        lacuna.body.findBuilding(buildings, 'Space Port')
      ).spread((sy, sp) => {
        if (!sy) {
          reject(`No Shipyard found on ${colony.name}`);
        } else if (!sp) {
          reject(`No Space Port found on ${colony.name}`);
        } else {
          resolve([sy, sp]);
        }
      });
    });
  }

  handleColony(colony, buildings) {
    return this.findShipBuildings(colony, buildings).spread((sy, sp) => {
      return this.determineToBuild(this.options.quantity, sy, sp).then((toBuild) => {
        if (this.options.quantity > toBuild) {
          // Explain to the user why we're building less than they asked for.

          if (this.options.topoff) {
            let msg = '';

            if (toBuild === 0) {
              msg = `no need to build more`;
            } else {
              msg = `building ${toBuild} more`;
            }

            log.info(`Some ships already built or under construction, ${msg}`);
          } else {
            let quantityPlural = util.handlePlurality(this.options.quantity, this.options.type);
            log.info(
              `Insufficient docks/queue space for ${this.options.quantity} ${quantityPlural}` +
                `, building ${toBuild} instead`
            );
          }
        }

        if (toBuild > 0) {
          return this.buildShips(colony, sy, toBuild);
        }
      });
    });
  }

  validateOptions() {
    this.options.quantity = util.int(this.options.quantity);

    let serverType = types.translateShipType(this.options.type);

    return new Promise((resolve, reject) => {
      if (!this.options.planet) {
        reject('please specify a planet');
      } else if (!this.options.quantity) {
        reject(`please specify a quantity`);
      } else if (!this.options.type) {
        reject(`please specify a type`);
      } else if (!serverType) {
        reject(`please specify a valid type`);
      } else {
        this.options.serverType = serverType;

        resolve(true);
      }
    });
  }

  run() {
    return new Promise((resolve, reject) => {
      lacuna.empire
        .findPlanets(this.options.planet)
        .then((colonies) => {
          return lacuna.empire.eachPlanet(colonies, _.bind(this.handleColony, this));
        })
        .then(() => {
          resolve();
        })
        .catch(reject);
    });
  }
}

export default BuildShips;
