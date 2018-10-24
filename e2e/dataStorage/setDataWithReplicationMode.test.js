jest.setTimeout(30000);

const Datum = require('../../index');
const { setupDatums } = require('../utils');

let datum;

beforeAll(() => {
  [datum] = setupDatums();
});

describe('set data with replicationMode', () => {
  const DATA = 'data';

  it.skip('sets data with a number as replicationMode', async () => {
    const REPLICATION_MODE = 2;
    const hash = await datum.set(DATA, undefined, undefined, REPLICATION_MODE);
    const item = await Datum.getItem(hash);
    expect(item.replicationMode).toBe(REPLICATION_MODE);
  });
});
