const fs = require('fs');
const path = require('path');
const axios = require('axios');

const Datum = require('../../../index');

const PASSWORD = 'password';
const DEPOSIT_AMOUNT = 100;

const waitForBalance = address => new Promise((resolve, reject) => {
  const intervalId = setInterval(() => {
    Datum.getBalance(address)
      .then((balance) => {
        if (balance > 0) {
          clearInterval(intervalId);
          resolve(balance);
        }
      })
      .catch(reject);
  }, 1000);
});

const getFaucet = async (address) => {
  try {
    await axios.get(`https://faucet.megatron.datum.org/v1/faucet/dat/${address}`);
    await waitForBalance(address);
  } catch (err) {
    if (err.response) {
      console.error('[getFaucet]:', err.response.data);
      return;
    }
    console.error('[getFaucet]:', err.message);
  }
};

const storeIdentity = (keystore, password) => {
  const [lastIdentityNum] = fs.readdirSync(__dirname)
    .filter(file => fs.statSync(path.join(__dirname, file)).isDirectory() && file.match(/^identity\d$/))
    .map(file => file.replace('identity', ''))
    .map(file => parseInt(file, 10))
    .sort((a, b) => (a > b ? -1 : 1));

  const newIdentityDir = path.join(__dirname, `identity${lastIdentityNum + 1}`);
  fs.mkdirSync(newIdentityDir);

  fs.writeFileSync(`${newIdentityDir}/keystore.json`, JSON.stringify(keystore));
  fs.writeFileSync(`${newIdentityDir}/password.json`, JSON.stringify(password));
};

const createIdentity = async () => {
  console.info('=== Create identity ===');

  console.info('1. Creating a new datum identity...');
  const datum = new Datum();
  const identity = await Datum.createIdentity(PASSWORD);
  datum.initialize({
    identity: identity.keystore,
  });
  datum.identity.storePassword(PASSWORD);

  console.info('2. Getting faucet to this identity...');
  await getFaucet(datum.identity.address);

  console.info('3. Making deposit to this identity...');
  await datum.deposit(DEPOSIT_AMOUNT);

  console.info('4. Storing identity keystore and password in identities/...');
  storeIdentity(identity.keystore, PASSWORD);

  return datum;
};

createIdentity()
  .then(() => {
    console.info('Successfully created identity!');
  })
  .catch(console.error);
