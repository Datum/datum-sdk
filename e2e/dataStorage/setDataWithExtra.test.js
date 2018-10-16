jest.setTimeout(30000);

const setupDatum = require('../utils/setupDatum');

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

// TODO: Find a way to verify if metadata is set correctly
describe('set data with metadata', () => {
  const DATA = 'data';

  it('sets data with a string as metadata', async () => {
    const METADATA = 'metadata';
    const hash = await datum.set(DATA, undefined, undefined, METADATA);
    expect(await datum.get(hash)).toBe(DATA);
  });
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

// TODO: Find a way to verify if duration is set correctly
describe('set data with duration', () => {
  const DATA = 'data';

  it('sets data with a number as duration', async () => {
    const DURATION = 10;
    const hash = await datum.set(
      DATA,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      DURATION,
    );
    expect(await datum.get(hash)).toBe(DATA);
  });
});
