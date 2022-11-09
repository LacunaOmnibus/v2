import _ from 'lodash';

import util from '../util';
import log from '../log';

import buildShips from './build-ships';
import buildingLevels from './building-levels';
import buildingTypes from './building-types';
import docks from './docks';
import dockedShips from './docked-ships';
import hallsCost from './halls-cost';
import makeHalls from './make-halls';
import makeSpies from './make-spies';
import pushBuildingsUp from './push-buildings-up';
import upgradeBuildings from './upgrade-buildings';
import pushGlyphs from './push-glyphs';
import scuttleShips from './scuttle-ships';
import spySkills from './spy-skills';
import spyStatus from './spy-status';
import spyTrainer from './spy-trainer';
import viewLaws from './view-laws';

/*
  Hello and welcome to Le Serf!

  This is the part of the code where every task that can be run is asembled
  into a big list that is then used by the Web and CLI packages. This
  list us simply an arrray of objects where each object reperesents a task.

  Each task must contain the following:
    - name: name of the task - used by the CLI
    - title: display name of the task - this is what web users see
    - description: describe in one sentence what your task does
    - platforms: array of platforms this task runs on - example: ['web']
      will make this task only visible on the Website
    - TaskClass: this is where your task's implementation goes it is a class
      that takes an initialized Lacuna object and an options object.
      This class must implement a `run` method which returns a promise.

      For example:

      ```javascript
        class MyFancyTask {
          constructor (options) {
            this.options = options
          }

          run () {
            return new Promise((resolve, reject) => {
              log.info('I am running now.')
              log.info('Access the options with `this.options`')
              resolve(`I'm done now! Yay!`)
            })
          }
        }
      ```

  Each task can optionally include the following:
    - defaults: object of default `options`
*/

const taskDefinitions = [
  {
    name: 'build-ships',
    title: 'Build Ships',
    description: 'Build ships in bulk',
    platforms: ['cli', 'web'],
    TaskClass: buildShips,
    defaults: {
      planet: '',
      type: '',
      quantity: 0,
      topoff: false,
      dryRun: false,
    },
  },

  {
    name: 'building-levels',
    title: 'Building Levels',
    description: 'View a list of the number of buildings at each level.',
    platforms: ['cli', 'web'],
    TaskClass: buildingLevels,
    defaults: {},
  },

  {
    name: 'building-types',
    title: 'Building Types',
    description: 'View a list of the number of each type of building you have.',
    platforms: ['cli', 'web'],
    TaskClass: buildingTypes,
    defaults: {},
  },

  {
    name: 'docked-ships',
    title: 'Docked Ships',
    description: 'View all the ships docked at a planet.',
    platforms: ['cli', 'web'],
    TaskClass: dockedShips,
    defaults: {
      planet: '',
    },
  },

  {
    name: 'docks',
    title: 'Docks',
    description: 'View all docks in your empire.',
    platforms: ['cli', 'web'],
    TaskClass: docks,
    defaults: {},
  },

  {
    name: 'halls-cost',
    title: 'Halls Cost',
    description: 'Calculate the cost of upgrading glyph buildings.',
    platforms: ['cli', 'web'],
    TaskClass: hallsCost,
    defaults: {
      start: 1,
      end: 30,
    },
  },

  {
    name: 'make-halls',
    title: 'Make Halls',
    description: 'Make Halls of Vrbansk on a given planet.',
    platforms: ['cli', 'web'],
    TaskClass: makeHalls,
    defaults: {
      planet: '',
    },
  },

  {
    name: 'make-spies',
    title: 'Make Spies',
    description: 'Fill all Intelligence Ministries with Spies.',
    platforms: ['cli', 'web'],
    TaskClass: makeSpies,
    defaults: {},
  },

  {
    name: 'push-buildings-up',
    title: 'Push Buildings Up',
    description: 'Upgrade all non-glyph buildings, lowest to highest.',
    platforms: ['cli', 'web'],
    TaskClass: pushBuildingsUp,
    defaults: {
      loop: false,
      dryRun: false,
    },
  },

  {
    name: 'push-glyphs',
    title: 'Push Glyphs',
    description: 'Push Glyphs between your planets.',
    platforms: ['cli', 'web'],
    TaskClass: pushGlyphs,
    defaults: {
      from: '',
      to: '',
    },
  },

  {
    name: 'scuttle-ships',
    title: 'Scuttle Ships',
    description: 'Clear out your Space Ports',
    platforms: ['cli', 'web'],
    TaskClass: scuttleShips,
    defaults: {
      planet: '',
      type: '',
      all: false,
    },
  },

  {
    name: 'spy-skills',
    title: 'Spy Skills',
    description: 'See what skill levels your spiies are.',
    platforms: ['cli', 'web'],
    TaskClass: spySkills,
    defaults: {
      planet: '',
    },
  },

  {
    name: 'spy-status',
    title: 'Spy Status',
    description: 'See where the hell all your spies are.',
    platforms: ['cli', 'web'],
    TaskClass: spyStatus,
    defaults: {
      planet: '',
    },
  },

  {
    name: 'spy-trainer',
    title: 'Spy Trainer',
    description: 'Train your spies.',
    platforms: ['cli', 'web'],
    TaskClass: spyTrainer,
    defaults: {
      planet: '',
      skill: '',
      dryRun: false,
    },
  },

  {
    name: 'upgrade-buildings',
    title: 'Upgrade Buildings',
    description: `Warning: this is only setup for 1vasari - use at own risk.`,
    platforms: ['cli'],
    TaskClass: upgradeBuildings,
    defaults: {
      loop: false,
      skip: [],
      planet: [],
    },
  },

  {
    name: 'view-laws',
    title: 'View Laws',
    description: `View the laws that have been enacted on a Space Station.`,
    platforms: ['cli', 'web'],
    TaskClass: viewLaws,
    defaults: {
      id: '',
    },
  },
];

// NOTE: this is actually defined with `function () {}` because it gets
// bound with a `this` value that needs to be retained and `() => {}`
// doesn't do that.
let handleTaskRun = (taskDefinition, options) => {
  if (!_.isUndefined(taskDefinition.defaults) && _.isObject(taskDefinition.defaults)) {
    // Handle defaults
    options = _.merge({}, taskDefinition.defaults, options);
  }

  let TaskClass = taskDefinition.TaskClass;
  let task = new TaskClass(options);

  return task
    .validateOptions()
    .then(() => {
      log.info(`Running "${taskDefinition.title}" task`);
      log.debug('Running with options:', options);
      log.newline();

      if (typeof options.dryRun === 'boolean' && options.dryRun) {
        log.info('RUNNING IN DRY-RUN MODE');
        log.newline();
      }

      return task
        .run()
        .then((message) => {
          log.newline();

          if (message) {
            log.info(message);
          }

          log.info('Done');
        })
        .catch((err) => {
          if (err) {
            log.newline();
            util.handlePromiseError(err);
          }
        });
    })
    .catch((err) => {
      util.handlePromiseError(err);
    });
};

// Setup each tasks's `run` method.
const tasks = _.map(taskDefinitions, (task) => {
  task.run = _.partial(handleTaskRun, task);
  return task;
});

let getTasksForPlatform = (platform) => {
  return _.filter(tasks, (task) => {
    return _.includes(task.platforms, platform);
  });
};

let getAllTasks = () => {
  return tasks;
};

let getTaskByName = (name) => {
  return _.filter(tasks, (task) => name === task.name)[0];
};

export { getAllTasks, getTasksForPlatform, getTaskByName };
