jest.setTimeout(30000);

const setupDatum = require('../utils/setupDatum');

let datum;

beforeAll(async (done) => {
  datum = await setupDatum();
  done();
});

describe('set data only', () => {
  it('stores string as data', async () => {
    const DATA = 'data';
    const hash = await datum.set(DATA);
    expect(await datum.get(hash)).toBe(DATA);
  });

  it('stores object as data', async () => {
    const DATA = { data: 'data' };
    const hash = await datum.set(DATA);
    expect(await datum.get(hash)).toBe(JSON.stringify(DATA));
  });

  // TODO: Verify the correct handling for number
  it('throws error if data is number', async () => {
    const DATA = 123;
    expect(() => datum.set(DATA)).toThrow('toString() radix argument must be between 2 and 36');
  });

  // TODO: Verify the correct handling for array
  it('throws error if data is array', async () => {
    const DATA = [];
    await expect(datum.set(DATA)).rejects.toThrow();
  });

  // TODO: Verify the correct handling for function
  it('throws error if data is function', async () => {
    const DATA = () => {};
    await expect(datum.set(DATA)).rejects.toThrow();
  });

  it('throws error if data is null', async () => {
    const DATA = null;
    expect(() => datum.set(DATA)).toThrow('Cannot read property \'toString\' of null');
  });

  it('throws error if data is undefined', async () => {
    expect(() => datum.set()).toThrow('Cannot read property \'toString\' of undefined');
  });
});