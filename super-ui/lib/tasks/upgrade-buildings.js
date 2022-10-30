import _ from 'lodash';
import Promise from 'bluebird';

import lacuna from '../lacuna';
import log from '../log';
import util from '../util';

import Timelist from '../timelist';

// This is the template that the upgrader follows.
// The template is comprised of sections.
// Each section is an array of buildings to upgrade.
// Each building is an object containing the name of the building and the level to upgrade to.
// Only one section is upgraded at a time.

const TEMPLATE = [
  // I tend to max my glyph buildings as soon as I colonise a colony. Hence, this is here.
  [
    {
      level: 30,
      name: 'Algae Pond',
    },
    {
      level: 30,
      name: 'Amalgus Meadow',
    },
    {
      level: 30,
      name: 'Beeldeban Nest',
    },
    {
      level: 30,
      name: 'Denton Brambles',
    },
    {
      level: 30,
      name: 'Lapis Forest',
    },
    {
      level: 30,
      name: 'Malcud Field',
    },
    {
      level: 30,
      name: 'Volcano',
    },
    {
      level: 30,
      name: 'Natural Spring',
    },
    {
      level: 30,
      name: 'Geo Thermal Vent',
    },
    {
      level: 30,
      name: 'Kalavian Ruins',
    },
    {
      level: 30,
      name: 'Interdimensional Rift',
    },
    {
      level: 30,
      name: 'Crashed Ship Site',
    },
    {
      level: 30,
      name: 'Pantheon of Hagness',
    },
  ],

  // Basic construction stuff.
  [
    {
      level: 30,
      name: 'Oversight Ministry',
    },
    {
      level: 5,
      name: 'Development Ministry',
    },
  ],

  // Get the Archaeology up a bit
  [
    {
      level: 25,
      name: 'Archaeology Ministry',
    },
  ],

  // Upgrade the shipyards so we can build some Excavators.
  [
    {
      level: 20,
      name: 'Shipyard',
    },
  ],

  // Upgrade the spaceports so we can hold some Excavators.
  [
    {
      level: 5,
      name: 'Space Port',
    },
  ],

  // Upgrade the Dev Min so we can build more.
  [
    {
      level: 15,
      name: 'Development Ministry',
    },
  ],

  // Some defence would be nice, too.
  [
    {
      level: 10,
      name: 'Shield Against Weapons',
    },
  ],

  // Upgrade the Archaeology all the way.
  [
    {
      level: 30,
      name: 'Archaeology Ministry',
    },
  ],

  // If you're cever enough to have one of these - go nuts.
  [
    {
      level: 30,
      name: 'Lost City of Tyleon (A)',
    },
    {
      level: 30,
      name: 'Lost City of Tyleon (B)',
    },
    {
      level: 30,
      name: 'Lost City of Tyleon (C)',
    },
    {
      level: 30,
      name: 'Lost City of Tyleon (D)',
    },
    {
      level: 30,
      name: 'Lost City of Tyleon (E)',
    },
    {
      level: 30,
      name: 'Lost City of Tyleon (F)',
    },
    {
      level: 30,
      name: 'Lost City of Tyleon (G)',
    },
    {
      level: 30,
      name: 'Lost City of Tyleon (H)',
    },
    {
      level: 30,
      name: 'Lost City of Tyleon (I)',
    },
  ],

  // Get started on all the spy releated stuff.
  [
    {
      level: 20,
      name: 'Intelligence Ministry',
    },
    {
      level: 20,
      name: 'Security Ministry',
    },
    {
      level: 20,
      name: 'Espionage Ministry',
    },
    {
      level: 20,
      name: 'Intel Training',
    },
    {
      level: 20,
      name: 'Mayhem Training',
    },
    {
      level: 20,
      name: 'Politics Training',
    },
    {
      level: 20,
      name: 'Theft Training',
    },
  ],

  // Get setup to make Space Station plans, too.
  [
    {
      level: 20,
      name: 'Space Station Lab (A)',
    },
    {
      level: 20,
      name: 'Space Station Lab (B)',
    },
    {
      level: 20,
      name: 'Space Station Lab (C)',
    },
    {
      level: 20,
      name: 'Space Station Lab (D)',
    },
  ],

  // Finish off the shipyards.
  [
    {
      level: 30,
      name: 'Shipyard',
    },
  ],

  // Max out the ship attribute buildings.
  [
    {
      level: 30,
      name: 'Trade Ministry',
    },
    {
      level: 30,
      name: 'Pilot Training Facility',
    },
    {
      level: 30,
      name: 'Munitions Lab',
    },
    {
      level: 30,
      name: 'Cloaking Lab',
    },
    {
      level: 30,
      name: 'Propulsion System Factory',
    },
  ],

  // Upgrade the defences a bit further.
  [
    {
      level: 20,
      name: 'Shield Against Weapons',
    },
  ],

  // Finish off the spy stuff.
  [
    {
      level: 30,
      name: 'Intelligence Ministry',
    },
    {
      level: 30,
      name: 'Security Ministry',
    },
    {
      level: 30,
      name: 'Espionage Ministry',
    },
    {
      level: 30,
      name: 'Intel Training',
    },
    {
      level: 30,
      name: 'Mayhem Training',
    },
    {
      level: 30,
      name: 'Politics Training',
    },
    {
      level: 30,
      name: 'Theft Training',
    },
  ],

  // Finish off the SAWs
  [
    {
      level: 30,
      name: 'Shield Against Weapons',
    },
  ],

  // These are all 'bonus buildings' that need to be upgraded eventually, I guess.
  [
    {
      level: 30,
      name: 'Mission Command',
    },
    {
      level: 30,
      name: 'Entertainment District',
    },
    {
      level: 30,
      name: 'Observatory',
    },
    {
      level: 30,
      name: 'Terraforming Lab',
    },
    {
      level: 30,
      name: 'Gas Giant Lab',
    },
    {
      level: 30,
      name: 'Subspace Transporter',
    },
    {
      level: 30,
      name: 'Planetary Command Center',
    },
    {
      level: 30,
      name: 'Network 19',
    },
    {
      level: 30,
      name: 'Genetics Lab',
    },
    {
      level: 30,
      name: 'Waste Sequestration Well',
    },
    {
      level: 30,
      name: 'Development Ministry',
    },
  ],

  // Waste some time on these...
  [
    {
      level: 30,
      name: 'Food Reserve',
    },
    {
      level: 30,
      name: 'Ore Storage Tanks',
    },
    {
      level: 30,
      name: 'Water Storage Tank',
    },
    {
      level: 30,
      name: 'Energy Reserve',
    },
  ],

  // Finally, upgrade all the Space Port. Only up to level 28 because 30 uses too much energy.
  [
    {
      level: 28,
      name: 'Space Port',
    },
  ],
];

class UpgradeBuildings {
  constructor(options) {
    this.options = options;

    this.options.skip = util.array(this.options.skip);
    this.options.planet = util.array(this.options.planet);

    // This is for tracking the number of buildings that have been upgraded this run.
    this.upgraded = 0;

    this.timelist = new Timelist();
  }

  // This method checks if a building can be upgraded.
  // It handles:
  //  - rejecting if there's any error
  checkPossibleUpgrade(bd) {
    return new Promise((resolve, reject) => {
      let b = lacuna.buildings.generic(bd.url);

      b.view([bd.id])
        .then((result) => {
          if (result.building.upgrade.can) {
            resolve();
          } else {
            let textReason = result.building.upgrade.reason[1];
            reject(textReason);
          }
        })
        .catch(reject);
    });
  }

  // This method upgrades the given building.
  // It handles:
  //  - logging the action to the screen
  //  - incrementing the buildings upgraded counter
  //
  upgradeBuilding(bd) {
    log.info(
      `Upgrading ${bd.name} (${bd.x}, ${bd.y}) from ${bd.level} to ` + `${bd.level * 1 + 1}`
    );

    return this.checkPossibleUpgrade(bd).then(() => {
      let b = lacuna.buildings.generic(bd.url);

      return b.upgrade([bd.id]).then((result) => {
        this.timelist.add(result.building.pending_build.end);
        this.upgraded++;
      });
    });
  }

  // This method upgrades a list of buildings according to the template.
  // It handles:
  //  - making sure that one section is upgraded at a time
  //  - makue sure we don't try to upgrade a building thats already upgrading
  //
  upgradeBuildings(buildings) {
    // This variable is used to ensure that one section is upgraded at a time.
    let sectionCompleted = true;

    return Promise.each(TEMPLATE, (section) => {
      // If the section isn't complete, don't go any further in the template.
      if (!sectionCompleted) {
        return;
      }

      return Promise.each(section, (build) => {
        // A build is an upgrade that should be done according to the template.
        // Here, we go through each one and see if it can be done.

        return lacuna.body.findBuildings(buildings, build.name).then((matches) => {
          // A 'match' is a building that matches the current 'build' within
          // the current 'section'.

          matches = _.sortBy(matches, (b) => util.int(b.level));

          return Promise.each(matches, (match) => {
            if (build.level > match.level) {
              // A section is considered incomplete when there's still more
              // that needs upgrading.
              sectionCompleted = false;

              // Don't try and upgrade something that's already upgrading.
              if (match.pending_build) {
                return;
              }

              return this.upgradeBuilding(match);
            }
          });
        });
      });
    });
  }

  handleSleep() {
    return new Promise((resolve, reject) => {
      this.timelist.sleepUntilSoonest(() => {
        log.newline();
        log.info('Running again');
        log.newline();

        resolve();
      });
    });
  }

  validateOptions() {
    return new Promise((resolve, reject) => {
      if (!this.options.planet) {
        reject('please specify a planet to upgrade buildings on');
      } else {
        resolve(true);
      }
    });
  }

  run() {
    return new Promise((resolve, reject) => {
      lacuna.empire
        .colonies()
        .then((colonies) => {
          return lacuna.empire.findPlanets(this.options.planet, this.options.skip);
        })
        .then((colonies) => {
          return lacuna.empire.eachPlanet(colonies, (colony, buildings) => {
            // Add existing build queues to the list.
            _.each(buildings, (b) => {
              if (b.pending_build) {
                this.timelist.add(b.pending_build.end);
              }
            });

            return this.upgradeBuildings(buildings);
          });
        })
        .then(() => {
          let plural = util.handlePlurality(this.upgraded, 'building');
          let message =
            this.upgraded === 0
              ? `Didn't upgrade any buildings`
              : `Successfully upgraded ${this.upgraded} ${plural}`;

          if (this.options.loop) {
            log.newline();
            log.info(message);

            return this.handleSleep().then(() => {
              this.upgraded = 0;
              this.timelist.clear();
              this.run();
            });
          } else {
            resolve(message);
          }
        })
        .catch(reject);
    });
  }
}

export default UpgradeBuildings;
