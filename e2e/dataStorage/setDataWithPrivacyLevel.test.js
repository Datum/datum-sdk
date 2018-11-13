jest.setTimeout(30000);

const { setupDatums } = require('../utils');

let datum;

beforeAll(() => {
  [datum] = setupDatums();
});

// TODO: Find a way to verify if privacy level is set correctly
describe('set data with privacy level', () => {
  const DATA = 'data';

  it('sets data with a number as privacy level', async () => {
    const PRIVACY_LEVEL = 2;
    const hash = await datum.set(DATA, undefined, undefined, undefined, undefined, PRIVACY_LEVEL);
    expect(await datum.get(hash)).toBe(DATA);
  });
});
