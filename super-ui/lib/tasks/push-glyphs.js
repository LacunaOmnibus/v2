import Promise from 'bluebird';
import _ from 'lodash';

import lacuna from '../lacuna';
import log from '../log';
import util from '../util';

class PushGlyphs {
  constructor(options) {
    this.options = options;

    this.glyphsPushed = 0;
  }

  getBestShip(requiredCargo, ships) {
    // TODO: should we support an option to specifiy a type of ship
    // for pushing glyphs? Or maybe a ship name?
    // If so, that all needs to happen in here.

    return _.chain(ships)
      .filter((ship) => util.int(ship.hold_size) >= requiredCargo)
      .sortBy((ship) => util.int(ship.speed))
      .first()
      .value();
  }

  prepareCargo(glyphs) {
    return _.map(glyphs, (glyph) => {
      return {
        type: 'glyph',
        name: glyph.name,
        quantity: glyph.quantity,
      };
    });
  }

  handleSending(from, to, tradeId) {
    let trade = lacuna.buildings.trade;

    return new Promise((resolve, reject) => {
      return trade
        .getGlyphs([tradeId])
        .then((summary) => {
          if (summary.glyphs.length === 0) {
            reject('No glyphs to push');
            return;
          }

          return trade.getTradeShips([tradeId, to.id]).then((ships) => {
            if (ships.ships.length === 0) {
              reject('No ships for pushing glyphs');
              return;
            }

            let total = _.sum(_.map(summary.glyphs, 'quantity'));
            let requiredCargo = total * summary.cargo_space_used_each;

            let ship = this.getBestShip(requiredCargo, ships.ships);

            if (!ship) {
              reject('No ship for pushing glyphs');
              return;
            }

            let cargo = this.prepareCargo(summary.glyphs);

            let params = [
              tradeId,
              to.id,
              cargo,
              {
                ship_id: ship.id,
                stay: 0,
              },
            ];

            log.info(`Pushing ${total} glyphs`);

            return trade.pushItems(params).then((result) => {
              let arrival = util.formatServerDate(result.ship.date_arrives);
              let plural = util.handlePlurality(total, 'glyph');

              log.info(`${total} ${plural} landing on ${to.name} at ${arrival}`);

              this.glyphsPushed += total;
              resolve();
            });
          });
        })
        .catch(reject);
    });
  }

  pushGlyphs(from, to, buildings) {
    return lacuna.body.findBuilding(buildings, 'Trade Ministry').then((tradeMin) => {
      if (!tradeMin) {
        return new Promise((resolve, reject) => {
          reject(`No Trade Ministry found on ${from.name}`);
        });
      } else {
        return this.handleSending(from, to, tradeMin.id);
      }
    });
  }

  validateOptions() {
    return new Promise((resolve, reject) => {
      if (!this.options.from) {
        reject('please specify a planet to push glyphs from');
      } else {
        resolve(true);
      }
    });
  }

  run() {
    return new Promise(async (resolve) => {
      const { status } = await lacuna.empire.getStatus({});

      if (status.empire.is_isolationist == 1) {
        log.info('Your empire is an isolationist and only has one colony.');
      }

      const fromColonies = await lacuna.empire.findPlanets(this.options.from, this.options.to);
      const to = await lacuna.empire.findPlanet(this.options.to);

      if (!fromColonies.length) {
        log.info('No colonies to push glyphs from.');
      }

      await lacuna.empire.eachPlanet(fromColonies, (colony, buildings) => {
        return this.pushGlyphs(colony, to, buildings);
      });

      let plural = util.handlePlurality(this.glyphsPushed, 'glyph') > 1 ? 'glyphs' : 'glyph';
      let message =
        this.glyphsPushed === 0
          ? `Didn't push any glyphs`
          : `Pushed a grand total of ${this.glyphsPushed} ${plural} to ${to.name}`;

      resolve(message);
    });
  }
}

export default PushGlyphs;
