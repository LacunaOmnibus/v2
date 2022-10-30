#!/usr/bin/env node

import program from 'commander';
import _ from 'lodash';

import * as taskIndex from '../lib/tasks';
const tasks = taskIndex.getTasksForPlatform('cli');

import pkgj from '../package.json';

program
  .version(pkgj.version)
  .command('reset', 'clear config file and start again')
  .command('setup', 'set up a config file');

_.each(tasks, (task) => {
  // Make descriptions consistent.
  let description = task.description.replace(/\.$/, '').toLowerCase();

  program.command(task.name, description);
});

program.parse(process.argv);
