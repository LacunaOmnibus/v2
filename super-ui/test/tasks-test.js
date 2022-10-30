// While it's near impossible to test individual tasks this test module
// tests whatever it can.

/* global describe */
/* global it */

let expect = require('chai').expect;
import _ from 'lodash';

let tasks = require('../lib/tasks').getAllTasks();

let testTask = (task) => {
  describe(`${task.title} task definition`, () => {
    it('should have a name', () => {
      expect(task.name).to.be.a('string');
    });

    it('should have a title', () => {
      expect(task.title).to.be.a('string');
    });

    it('should have a description', () => {
      expect(task.description).to.be.a('string');
    });

    it('should have a defaults object', () => {
      expect(task.defaults).to.be.a('object');
    });

    it('should have a validateOptions method', () => {
      expect(task.TaskClass.prototype.validateOptions).to.be.a('function');
    });

    it('should have a run method', () => {
      expect(task.run).to.be.a('function');
    });
  });
};

_.each(tasks, testTask);
