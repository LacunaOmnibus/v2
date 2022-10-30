import program from 'commander';
import _ from 'lodash';
import runner from '../lib/cli/task-runner';

let list = (str) => str.split(',');

program
  .option('-l, --loop', 'wait for builds to finish and run again')
  .option('-p --planet [name]', 'specify planet(s) to upgrade buildings on', list)
  .option('-s --skip [planet name]', 'specify planet(s) to skip', list)
  .parse(process.argv);

let options = _.pick(program, ['loop', 'planet', 'skip']);
runner.run('upgrade-buildings', options);
