jest.setTimeout(30000);

const setupDatum = require('../utils/setupDatum');
const Datum = require('../../index');

let datum;

beforeAll(async (done) => {
  datum = await setupDatum();
  done();
});

describe('set data with owner', () => {
  const DATA = 'data';

  it('sets data with a string address as owner', async () => {
    const OWNER = '0x85150aae8cdfe40f7125cba4413465ca7317c33a';
    const hash = await datum.set(
      DATA,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      OWNER,
    );
    const item = await Datum.getItem(hash);
    expect(item.owner.toUpperCase()).toBe(OWNER.toUpperCase());
  });

  it('throws an error if owner is not a valid address', async () => {
    const OWNER = 'owner';
    await expect(datum.set(
      DATA,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      OWNER,
    )).rejects.toThrow('Provided address "owner" is invalid, the capitalization checksum test failed, or its an indrect IBAN address which can\'t be converted.');
  });
});
