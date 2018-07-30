# datum-sdk
*javascript api for Datum Blockchain*

### Installation

#### Node
```
npm install datum-sdk --save
```

#### Browser
[![](https://data.jsdelivr.com/v1/package/npm/datum-sdk/badge)](https://www.jsdelivr.com/package/npm/datum-sdk)

Add this link in your page

```
<script src="https://cdn.jsdelivr.net/npm/datum-sdk@0.1.5/dist/datum.min.js"></script>

```
#### React-Native
[Steps to setup your React-Native project to use Datum-SDK](docs/react-native.md)

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


[For more examples checkout our getting started documentations](https://gettingstarted.datum.org/)


### Testing (mocha)

Run tests based Mocha test framework

```
mocha ./test
```
##### Testing SDK before publishing
It is important to test SDK locally before we publish. The idea is to test the SDK as if we are the SDK users and we are using it through *npm install.*

Though there are plenty of ways to do that, listed below are the steps on how to achieve that using a very simple approach.
```
1. Delete node_modules from sdk project.
2. Create a folder outside of the sdk project folder, call it test_sdk (name is up to you)
3. cd test_sdk
4. npm init
5. npm install --save ../datum-sdk/index.js --production
6. touch index.js
7. inside your index.js test the functionalities you are interested in.
```
The purpose of this test it to check how the SDK will behave from SDK user perspective, ***Testing SDK functionalities should be done via unit and integration testing.***

## Documentations

[Getting Started](https://gettingstarted.datum.org/)

## Examples

[Check our examples folder.](docs/example.md)
