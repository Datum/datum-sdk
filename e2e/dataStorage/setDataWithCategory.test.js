jest.setTimeout(30000);

const { setupDatum } = require('../utils');

let datum;

beforeAll(async (done) => {
  datum = await setupDatum();
  done();
});

// TODO: Find a way to verify if category is set correctly
describe('set data with category', () => {
  const DATA = 'data';

  it('sets data with a string as category', async () => {
    const CATEGORY = 'category';
    const hash = await datum.set(DATA, undefined, CATEGORY);
    expect(await datum.get(hash)).toBe(DATA);
  });
});
