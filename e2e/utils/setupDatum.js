const axios = require('axios');
const Datum = require('../../index');

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

const setupDatum = async () => {
  const datum = new Datum();
  const id = await Datum.createIdentity(PASSWORD);
  datum.initialize({
    identity: id.keystore,
  });
  datum.identity.storePassword(PASSWORD);

  const { address } = datum.identity;

  await getFaucet(address);

  await datum.deposit(DEPOSIT_AMOUNT);

  return datum;
};

module.exports = setupDatum;
