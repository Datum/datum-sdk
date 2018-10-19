jest.setTimeout(30000);

const Datum = require('../../index');
const { setupDatum } = require('../utils');

const SUBJECT_ADDRESS = '0xd0164ed25f7f243a9ccab80cace48ac9a5f39cd4';

let datum;

beforeAll(async (done) => {
  datum = await setupDatum();
  done();
});

describe('verify claim', () => {
  it('verifies whether a claim exist and whether the claim is signed by the issuer', async () => {
    const issuerAddress = datum.identity.address;
    const KEY = 'key';
    const VALUE = 'value';

    expect(await Datum.verifiyClaim(issuerAddress, SUBJECT_ADDRESS, KEY)).toBeFalsy();

    await datum.addClaim(SUBJECT_ADDRESS, KEY, VALUE);
    expect(await Datum.verifiyClaim(issuerAddress, SUBJECT_ADDRESS, KEY)).toBeTruthy();
  });
});
