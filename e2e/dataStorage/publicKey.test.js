jest.setTimeout(60000);

// const Datum = require('../../index');
const { setupDatum } = require('../utils');

let datum;
let anotherAccount;

beforeAll(async (done) => {
  datum = await setupDatum();
  anotherAccount = await setupDatum();
  done();
});

describe('addPublicKeyForData', () => {
  it('adds public key for data by data hash', async () => {
    const DATA = 'data';
    const hash = await datum.set(DATA);
    const publicKey = await anotherAccount.getIdentityPublicKey();
    const encryptionKey = await anotherAccount.getEncryptionPublicKey();

    await datum.addPublicKeyForData(hash, {
      publicKey,
      encryptionKey,
    });

    expect(await anotherAccount.get(hash)).toBe(DATA);
    // expect(await Datum.canAccess(hash, anotherAccount.identity.address)).toBeTruthy();
  });
});

describe('removePublicKeyForData', () => {
  it('removes public key for data by data hash and public key address', async () => {
    const DATA = 'data';
    const hash = await datum.set(DATA);
    const publicKey = await anotherAccount.getIdentityPublicKey();
    const encryptionKey = await anotherAccount.getEncryptionPublicKey();

    await datum.addPublicKeyForData(hash, {
      publicKey,
      encryptionKey,
    });

    await datum.removePublicKeyForData(hash, publicKey);

    await expect(anotherAccount.get(hash)).rejects.toThrow('error downloading content');
    // expect(await Datum.canAccess(hash, anotherAccount.identity.address)).toBeFalsy();
  });
});
