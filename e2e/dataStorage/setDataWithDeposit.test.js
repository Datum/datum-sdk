jest.setTimeout(30000);

const BigNumber = require('bignumber.js');
const setupDatum = require('../utils/setupDatum');
const Datum = require('../../index');

let datum;

beforeAll(async (done) => {
  datum = await setupDatum();
  done();
});

describe('set data with deposit', () => {
  const DATA = 'data';

  it('sets data and increases account\'s deposit balance', async () => {
    const { address } = datum.identity;
    const originalDeposit = new BigNumber((await Datum.getDepositBalance(address)).toString());

    const DEPOSIT = 20;
    await datum.set(
      DATA,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      DEPOSIT,
    );

    const newDeposit = new BigNumber((await Datum.getDepositBalance(address)).toString());
    expect(newDeposit.minus(originalDeposit).toNumber()).toBe(DEPOSIT);
  });
});
