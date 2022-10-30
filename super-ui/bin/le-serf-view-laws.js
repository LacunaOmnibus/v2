import program from 'commander';
import _ from 'lodash';
import runner from '../lib/cli/task-runner';

program.option('-i --id [station id]', 'ID of the station to view laws on').parse(process.argv);

let options = _.pick(program, ['id']);
runner.run('view-laws', options);
