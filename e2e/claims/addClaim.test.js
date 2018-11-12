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

describe('add claim', () => {
  it('adds claim with subject, key, value', async () => {
    const issuerAddress = datum.identity.address;
    const subjectAddress = anotherAccount.identity.address;
    const KEY = 'key';
    const VALUE = 'value';

    await datum.addClaim(subjectAddress, KEY, VALUE);
    expect(await Datum.verifyClaim(issuerAddress, subjectAddress, KEY)).toBeTruthy();

    const claim = await Datum.getClaim(issuerAddress, subjectAddress, KEY);
    expect(claim).toBe(VALUE);

    const claims = await Datum.getClaims(subjectAddress);
    const relatedClaim = claims.filter(c => (
      c.issuer.toUpperCase() === issuerAddress.toUpperCase()
        && c.subject.toUpperCase() === subjectAddress.toUpperCase()
        && c.key === dataToHex(KEY)
        && c.value === dataToHex(VALUE)
    ));
    expect(relatedClaim).toHaveLength(1);

    const cliamsByIssuer = await Datum.getClaimsByIssuer(issuerAddress);
    const relatedClaimByIssuer = cliamsByIssuer.filter(c => (
      c.issuer.toUpperCase() === issuerAddress.toUpperCase()
        && c.subject.toUpperCase() === subjectAddress.toUpperCase()
        && c.key === dataToHex(KEY)
        && c.value === dataToHex(VALUE)
    ));
    expect(relatedClaimByIssuer).toHaveLength(1);
  });
});
