const identities = require('./identities');
const Datum = require('../../index');

const setupDatums = ({
  identityCount = 1,
} = {}) => {
  if (identityCount > identities.length) {
    throw new Error('Identities are not enough');
  }

  return identities.slice(0, identityCount).map((identity) => {
    const datum = new Datum();
    datum.initialize({
      identity: identity.keystore,
    });
    datum.identity.storePassword(identity.password);

    return datum;
  });
};

module.exports = setupDatums;
