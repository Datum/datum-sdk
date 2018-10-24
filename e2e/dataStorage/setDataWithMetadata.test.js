jest.setTimeout(30000);

const { setupDatums } = require('../utils');

let datum;

beforeAll(() => {
  [datum] = setupDatums();
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
