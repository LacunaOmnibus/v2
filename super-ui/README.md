# Le Serf

> Your trusty assistant in your Lacuna Expanse misadventures!

**Note:** as of March 2016, this project is in "maintenance mode". This means I'll only keep it running rather than add new features. This is because I am no longer a player of The Lacuna Expanse. There are breaking server changes on the horizon and when they go live none of this will work anymore. Sadly, there's not much I can do.

**Additional:** as of October 2016 TLE will be offline. Therefore, Le Serf will not be needed anymore and will be taken offline, also.

**Final:** Le Serf has now been taken offline. Thanks for everything, folks.

[![Build Status](https://travis-ci.org/1vasari/le-serf.svg)](https://travis-ci.org/1vasari/le-serf)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Dependency Status](https://david-dm.org/1vasari/le-serf.svg)](https://david-dm.org/1vasari/le-serf)
[![devDependency Status](https://david-dm.org/1vasari/le-serf/dev-status.svg)](https://david-dm.org/1vasari/le-serf#info=devDependencies)

# Ch-Ch-Ch Changes!

## 2.0.2

**Released**: May 2 2016

- Fixed typo in `push-buildings-up` that caused it to upgrade Space Ports higher than level 28.

## 2.0.1

**Released**: March 9 2016

- Bug fixes.

## 2.0.0

**Released**: March 8 2016

**Tasks**

- Implemented new `docks` task.
- Implemented new `spy-status` task.
- Implemented new `spy-skills` task.
- `upgrade-buildings` handles low-level buildings better.
- `push-buildings-up` now has an option to wait for buildings to finish upgrading.
- Fixed the output of `build-ships`

**Technical**

- Moved `le-serf/le-serf` to `1vasari/le-serf`.
- Changed my email and website.
- When the version number changes the website reloads itself (without cache).
- Added some unit tests.

**Web**

- Implemented a fancy loading screen.

## 1.4.0

**Released:** January 22nd 2016

**Tasks**

- Implemented new `docked-ships` task.
- `buildings-levels` now outputs a pretty table.
- `buildings-types` now outputs a pretty table.
- `view-laws` now outputs a pretty table.

**Technical**

- The logger now outputs the log level on each line of a multiline message.

**Web**

- Vast improvements to the user interface.

## 1.3.0

**Released:** January 15th 2016

**General**

- General fixes and maintenance.

**Tasks**

- Implemented new `scuttle-ships` task.
- Stripped down and revamped the `spy-trainer` task.
- General fixing of the `make-halls` task.

**Web**

- Fixed loading of my Gravatar image on the About page.

## 1.2.1

**Released:** January 12th 2016

- Quick fix.

## 1.2.0

**Released:** January 12th 2016

**Bugs**

- `upgrade-buildings` now upgrades groups of the same type of building in order of level (lowest to highest).

**CLI**

- Rationalized all the different means of specifying a planet. Now there's only one: `--planet`.

**General**

- Tasks handle invalid arguments properly.
- Implemented handling of Captchas all round.

**Tasks**

- Implemented new `build-ships` task.
- Implemented new `push-buildings-up` task.
- Implemented new `spy-trainer` task.
- Implemented new `view-laws` task.

**Technical**

- Started using [Greenkeeper](http://greenkeeper.io/) to keep dependencies up-to-date.
- Lots of refactoring.
- Started documenting the project using [JSDoc](http://usejsdoc.org/).
- Handle session IDs better by not logging into the game every time a task is run.
- Travis CI now tests on Node `5.0`

**Web**

- Handle errors on signing in.
- Improved About page.

## 1.1.2

**Released:** November 27th 2015

- Fixed `.npmignore`

## 1.1.1

**Released:** November 27th 2015

- Messed up the `package.json`.

## 1.1.0

**Released:** November 27th 2015

- Started keeping a changes log.

## 1.0.0

**Released:** November 27th 2015

- Collected all the code from all the different repositories into this one repository.

# Notes

**Don't use ES6 Modules**

Because I don't like them - CommonJS modules seem cleaner to me.

**Don't use ES6 Classes to define React Components**

Because they [don't support mixins](https://facebook.github.io/react/docs/reusable-components.html#no-mixins). ES6 Classes are being used for other things, though.

**package.json**

All dependencies for the web site are specified as `devDependencies` so that they don't get included in the published npm module.
