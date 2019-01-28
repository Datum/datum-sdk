# datum-sdk
*javascript api for Datum Blockchain*

## Documentations

[Getting Started](https://gettingstarted.datum.org/)

### Installation

#### Node
```
npm install datum-sdk --save
```

#### Browser
[![](https://data.jsdelivr.com/v1/package/npm/datum-sdk/badge)](https://www.jsdelivr.com/package/npm/datum-sdk)

Add this link in your page

```
<script src="https://cdn.jsdelivr.net/npm/datum-sdk/dist/datum.min.js"></script>

```
#### React-Native
[Steps to setup your React-Native project to use Datum-SDK](docs/react-native.md)

### Test

#### E2E tests

```
npm run test:e2e
```

### Usage

Use the Datum object directly from global namespace:
```
console.log(Datum); // {version: {…}}
```

Create Datum Identity
```
const password = 'Hollow Morpheus Mauled...';
Datum.createIdentity(
  password
).then((res) => {
  console.log(res) // {seed:"...", keystore:"{"encSeed":{"encStr":"eddG2...","hdIndex":1,"version":3}"}
}).catch((e) => {
  console.error(e)
});
```

### Publish package

Publishing package is automated by [CircleCI](https://circleci.com/gh/Datum/datum-sdk-internal) every time `master` branch has been updated. However, you still need to manually update the version number as determining semantic version cannot be automated. To update the version, run [`npm version` command](https://docs.npmjs.com/cli/version.html), push it to upstream and merge it to `master` branch.

## Examples

[For more code snippets checkout our getting started documentations](https://gettingstarted.datum.org/)

[Check our examples folder.](docs/example.md)


### Testing (mocha)

Run tests based Mocha test framework

```
mocha ./test
```
