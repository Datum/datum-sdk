jest.setTimeout(30000);

const { setupDatum } = require('../utils');

let datum;

beforeAll(async (done) => {
  datum = await setupDatum();
  done();
});

// TODO: Find a way to verify if metadata is set correctly
describe('set data with metadata', () => {
  const DATA = 'data';

  it('sets data with a string as metadata', async () => {
    const METADATA = 'metadata';
    const hash = await datum.set(DATA, undefined, undefined, METADATA);
    expect(await datum.get(hash)).toBe(DATA);
  });
});
