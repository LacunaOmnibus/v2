import Promise from 'bluebird';
import _ from 'lodash';

import Module from '../module';
import lacuna from '../../lacuna';

import log from '../../log';
import util from '../../util';

/**
 * TODO
 *
 * @memberof lacuna
 * @namespace lacuna.empire
 * @alias lacuna.empire
 */
class Empire extends Module {
  constructor() {
    super();

    this.apiMethods('empire', [
      'boost_building',
      'boost_energy',
      'boost_food',
      'boost_happiness',
      'boost_ore',
      'boost_storage',
      'boost_water',
      'change_password',
      'create',
      'disable_self_destruct',
      'edit_profile',
      'enable_self_destruct',
      'fetch_captcha',
      'find',
      'found',
      'get_invite_friend_url',
      'get_species_templates',
      'get_status',
      'invite_friend',
      'is_name_available',
      'login',
      'logout',
      'redeem_essentia_code',
      'redefine_species_limits',
      'redefine_species',
      'reset_password',
      'send_password_reset_message',
      'set_status_message',
      'spy_training_boost',
      'update_species',
      'view_boosts',
      'view_profile',
      'view_public_profile',
      'view_species_stats',
    ]);
  }

  /**
   * This function is for handling the `--planet` argument.
   *
   * It can be one of three things:
   *  - the string 'all'
   *  - a planet name
   *  - an array of planet names
   *
   * @example
   * lacuna.empire.findPlanets(['Earth', 'Mars'])
   * // Returns:
   * [
   *   {
   *     name: 'Earth',
   *     id: 3
   *   },
   *   {
   *     name: 'Mars',
   *     id: 4
   *   }
   * ]
   *
   * @memberof lacuna.empire
   * @alias lacuna.empire.findPlanets
   *
   * @param  {string|array} planet - the planet names you want to find
   * @param  {string|array} skip   - the planet names you want to skip
   * @return {array}                 array of the planets that were found
   */
  findPlanets(planet, skip) {
    let arr = util.array(planet);
    let toSkip = util.array(skip);

    log.debug(`Handling --planet`, planet);
    log.debug(`Handling --skip`, skip);

    return new Promise((resolve, reject) => {
      if (arr.length === 0) {
        reject('please specify a planet');
        return;
      }

      if (_.include(arr, 'all')) {
        lacuna.empire.colonies().then(resolve).catch(reject);
      } else {
        this.getStatus({}).then(({ status }) => {
          // Invert so we can key by name instead of ID
          let planets = _.invert(status.empire.planets);

          return Promise.mapSeries(arr, (planetName) => {
            return new Promise((resolve, reject) => {
              let planetId = planets[planetName];

              if (planetId) {
                resolve({
                  id: planetId,
                  name: planetName,
                });
              } else {
                reject(`Planet ${planetName} not found`);
              }
            });
          }).then((planets) => {
            resolve(planets);
          });
        });
      }
    })
      .then((bodies) => {
        // Handle skipping of bodies.
        return _.filter(bodies, (body) => {
          return !_.include(toSkip, body.name);
        });
      })
      .then((result) => {
        log.debug(`handlePlanetArg result:`, result);
        return result;
      });
  }

  findPlanet(name) {
    return this.findPlanets(util.array(name)).then(_.first);
  }

  /**
   * Loop through each given planet while handling getting buildings, unhappiness and errors.
   *
   * @example
   * // Go thru each colony
   * lacuna.empire.colonies.then((colonies) => {
   *   return lacuna.empire.eachPlanet(colonies, (colony, buildings) => {
   *     // Do stuff with colony or buildings.
   *     // Erorrs thrown in here are logged to the console and don't kill the current task.
   *   })
   * })
   *
   * @example
   * // Go thru each colony ignoring unhappiness checks (NOT RECOMMENDED)
   * lacuna.empire.colonies.then((colonies) => {
   *   return lacuna.empire.eachPlanet(colonies, (colony, buildings) => {
   *     // Do stuff with colony or buildings.
   *     // Erorrs thrown in here are logged to the console and don't kill the current task.
   *   }, {force: true})
   * })
   *
   * @memberof lacuna.empire
   * @alias lacuna.empire.eachPlanet
   *
   * @param  {array}   planets  - the list of planets you want to loop through
   * @param  {function} callback - a thenable to run on each planet
   * @param  {object}  opts     - options (set `force` to true to ignore unhappiness checks here)
   */
  eachPlanet(planets, callback, opts) {
    opts = _.defaults(opts || {}, { force: false });

    return Promise.each(planets, (planet) => {
      log.newline();
      log.info(`Looking at ${planet.name}`);

      return lacuna.body.getBuildings({ body_id: planet.id }).then((result) => {
        let buildings = util.objectToArray(result.buildings, 'id');

        // Don't do anything on planets that are unhappy. When a planet's happniess is negative
        // making anything (ships, spies, buildings or SS plans) is slowed down significantly.
        if (util.int(result.status.body.happiness) < 0 && !opts.force) {
          log.error(`${planet.name} is unhappy`);
          return;
        }

        return callback(planet, buildings)
          .catch((err) => {
            util.handlePromiseError(err);
          })
          .finally(() => {
            log.info('Moving on');
          });
      });
    });
  }

  planets() {
    return this.findBodiesType('planets');
  }

  stations() {
    return this.findBodiesType('stations');
  }

  colonies() {
    return this.findBodiesType('colonies');
  }

  findBodiesType(type) {
    return this.getStatus({}).then(({ status }) => {
      let arr = [];

      _.each(status.empire[type], function (value, key) {
        arr.push({
          id: key,
          name: value,
        });
      });

      return _.sortBy(arr, 'name');
    });
  }

  homePlanet() {
    return this.getStatus({}).then(({ status }) => {
      return {
        id: status.empire.home_planet_id,
        name: status.empire.planets[status.empire.home_planet_id],
      };
    });
  }

  getAllBuildings() {
    return new Promise((resolve, reject) => {
      let result = [];

      this.colonies()
        .then((colonies) => {
          return Promise.mapSeries(colonies, (colony) => {
            log.info(`Looking at ${colony.name}`);

            return lacuna.body.buildings(colony.id).then((buildings) => {
              result = result.concat(buildings);
            });
          });
        })
        .then(() => {
          resolve(result);
        })
        .catch(reject);
    });
  }
}

export default Empire;
