import React from 'react';

import Gravatar from 'react-gravatar';

import packageJson from '../../../../package';
let repoURL = packageJson.repository.url;

let changesLink = repoURL + '#' + packageJson.version.replace(/\./g, '');

let AboutScreen = React.createClass({
  render() {
    return (
      <div className='text-center'>
        <h1>About</h1>

        <p>
          Le serf version{' '}
          <a href={changesLink} target='_blank'>
            {packageJson.version}
          </a>
          .
        </p>

        <p>
          <Gravatar
            email='me@1vasari.xyz'
            size={200}
            className='img-circle'
            http={window.location.protocol === 'http:'}
            https={window.location.protocol === 'https:'}
          />
        </p>

        <p>
          Le serf is an{' '}
          <a target='_blank' href={repoURL}>
            open source
          </a>{' '}
          creation by{' '}
          <a target='_blank' href='http://1vasari.xyz'>
            1vasari
          </a>
          .
        </p>
      </div>
    );
  },
});

export default AboutScreen;
