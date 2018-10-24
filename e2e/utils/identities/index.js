const fs = require('fs');
const path = require('path');

const identities = fs.readdirSync(__dirname)
  .filter(file => fs.statSync(path.join(__dirname, file)).isDirectory() && file.match(/^identity\d$/))
  .map(identityDir => {
    const keystore = require(`${path.join(__dirname, identityDir)}/keystore`);
    const password = require(`${path.join(__dirname, identityDir)}/password`);
    return {
      keystore,
      password,
    };
  });

module.exports = identities;
