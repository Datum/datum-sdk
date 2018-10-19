jest.setTimeout(30000);

const Datum = require('../../index');
const {
  setupDatum,
  dataToHex,
} = require('../utils');

const SUBJECT_ADDRESS = '0xd0164ed25f7f243a9ccab80cace48ac9a5f39cd4';

let datum;

beforeAll(async (done) => {
  datum = await setupDatum();
  done();
});

describe('remove claim', () => {
  it('removes claim with subject, key, value', async () => {
    const issuerAddress = datum.identity.address;
    const KEY = 'key';
    const VALUE = 'value';
    await datum.addClaim(SUBJECT_ADDRESS, KEY, VALUE);

    await datum.removeClaim(issuerAddress, SUBJECT_ADDRESS, KEY);

    const claim = await Datum.getClaim(issuerAddress, SUBJECT_ADDRESS, KEY);
    expect(claim).toBe('Claim not found.');

    const claims = await Datum.getClaims(SUBJECT_ADDRESS);
    const relatedClaim = claims.filter(c => (
      c.issuer.toUpperCase() === issuerAddress.toUpperCase()
        && c.subject.toUpperCase() === SUBJECT_ADDRESS.toUpperCase()
        && c.key === dataToHex(KEY)
        && c.value === dataToHex(VALUE)
    ));
    expect(relatedClaim).toHaveLength(0);

    const cliamsByIssuer = await Datum.getClaimsByIssuer(issuerAddress);
    const relatedClaimByIssuer = cliamsByIssuer.filter(c => (
      c.issuer.toUpperCase() === issuerAddress.toUpperCase()
        && c.subject.toUpperCase() === SUBJECT_ADDRESS.toUpperCase()
        && c.key === dataToHex(KEY)
        && c.value === dataToHex(VALUE)
    ));
    expect(relatedClaimByIssuer).toHaveLength(0);
  });
});
