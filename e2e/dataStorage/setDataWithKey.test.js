jest.setTimeout(30000);

const Datum = require('../../index');
const { setupDatum } = require('../utils');

let datum;

beforeAll(async (done) => {
  datum = await setupDatum();
  done();
});

describe('set data with key', () => {
  const DATA = 'data';

  it.skip('sets data with a string as key', async () => {
    const KEY = 'key';
    const hash = await datum.set(DATA, KEY);
    expect(await datum.get(hash)).toBe(DATA);
    expect(await datum.getWithKey(KEY)).toBe(DATA);
    expect(await Datum.getIdsForKey(datum.identity.address, KEY)).toContain(hash);
    expect(await Datum.getLastIdForKey(datum.identity.address, KEY)).toBe(hash);
  });

  it.skip('overwrites data with the same key', async () => {
    const NEW_DATA = 'new data';
    const KEY = 'key';
    const hash = await datum.set(NEW_DATA, KEY);
    expect(await datum.get(hash)).toBe(NEW_DATA);
    expect(await datum.getWithKey(KEY)).toBe(NEW_DATA);
    expect(await Datum.getIdsForKey(datum.identity.address, KEY)).toContain(hash);
    expect(await Datum.getLastIdForKey(datum.identity.address, KEY)).toBe(hash);
  });
});
