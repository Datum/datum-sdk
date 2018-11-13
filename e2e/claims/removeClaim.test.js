jest.setTimeout(30000);

const Datum = require('../../index');
const {
  setupDatums,
  dataToHex,
} = require('../utils');

let datum;
let anotherAccount;

beforeAll(() => {
  [datum, anotherAccount] = setupDatums({
    identityCount: 2,
  });
});

describe('remove claim', () => {
  it('removes claim with subject, key, value', async () => {
    const issuerAddress = datum.identity.address;
    const subjectAddress = anotherAccount.identity.address;
    const KEY = 'key';
    const VALUE = 'value';

    await datum.addClaim(subjectAddress, KEY, VALUE);
    await datum.removeClaim(issuerAddress, subjectAddress, KEY);
    // expect(await Datum.verifyClaim(issuerAddress, subjectAddress, KEY)).toBeFalsy();

    const claim = await Datum.getClaim(issuerAddress, subjectAddress, KEY);
    expect(claim).toBe('Claim not found');

    const claims = await Datum.getClaims(subjectAddress);
    const relatedClaim = claims.filter(c => (
      c.issuer.toUpperCase() === issuerAddress.toUpperCase()
        && c.subject.toUpperCase() === subjectAddress.toUpperCase()
        && c.key === dataToHex(KEY)
        && c.value === dataToHex(VALUE)
    ));
    expect(relatedClaim).toHaveLength(0);

    const cliamsByIssuer = await Datum.getClaimsByIssuer(issuerAddress);
    const relatedClaimByIssuer = cliamsByIssuer.filter(c => (
      c.issuer.toUpperCase() === issuerAddress.toUpperCase()
        && c.subject.toUpperCase() === subjectAddress.toUpperCase()
        && c.key === dataToHex(KEY)
        && c.value === dataToHex(VALUE)
    ));
    expect(relatedClaimByIssuer).toHaveLength(0);
  });
});
