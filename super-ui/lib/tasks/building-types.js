import _ from 'lodash';
// import Table from 'cli-table'

import lacuna from '../lacuna';
import log from '../log';
import util from '../util';

class BuildingTypes {
  constructor(options) {
    this.options = options;
  }

  validateOptions() {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  run() {
    return lacuna
      .authenticate()
      .then(() => {
        return lacuna.empire.getAllBuildings();
      })
      .then((buildings) => {
        let table = new Table({
          head: ['Quantity', 'Type', 'Average Level'],
        });

        _.chain(buildings)
          .thru((buildings) => {
            let obj = {};

            _.each(buildings, (b) => {
              if (!obj[b.name]) {
                obj[b.name] = [];
              }

              obj[b.name] = obj[b.name].concat([util.int(b.level)]);
            });

            return obj;
          })
          .mapValues((levels, name) => {
            return [levels.length, name, util.mean(levels)];
          })
          .values()
          .sortBy((arr) => arr[1])
          .sortBy((arr) => arr[0])
          .each((b) => table.push(b))
          .value();

        log.newline();
        log.info(table.toString());
      });
  }
}

export default BuildingTypes;
