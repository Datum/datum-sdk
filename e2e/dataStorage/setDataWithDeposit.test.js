jest.setTimeout(30000);

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
    const originalDeposit = await Datum.getDepositBalance(address);

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

    const newDeposit = await Datum.getDepositBalance(address);
    expect(newDeposit - originalDeposit).toBe(DEPOSIT);
  });
});
