jest.setTimeout(30000);

const setupDatum = require('../utils/setupDatum');
const Datum = require('../../index');

let datum;

beforeAll(async (done) => {
  datum = await setupDatum();
  done();
});

describe('set data with replicationMode', () => {
  const DATA = 'data';

  it('sets data with a number as replicationMode', async () => {
    const REPLICATION_MODE = 2;
    const hash = await datum.set(DATA, undefined, undefined, REPLICATION_MODE);
    const item = await Datum.getItem(hash);
    expect(item.replicationMode).toBe(REPLICATION_MODE);
  });
});
