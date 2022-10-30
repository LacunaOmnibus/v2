import React from 'react';
import _ from 'lodash';

import * as taskIndex from '../../../../lib/tasks';
const tasks = taskIndex.getTasksForPlatform('web');

import RunnerActions from '../../actions/runner';

let TaskSelectionScreen = React.createClass({
  handleTaskSelect(event) {
    RunnerActions.setSelectedTask(event.target.attributes.value.nodeValue);
  },

  render() {
    return (
      <div className='row'>
        <div className='col-md-4 col-md-offset-4'>
          <h1 className='center-text'>Select a Task</h1>

          <ul>
            {_.map(tasks, (task) => {
              return (
                <li
                  key={task.name}
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  <a value={task.name} title={task.description} onClick={this.handleTaskSelect}>
                    {task.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  },
});

export default TaskSelectionScreen;
