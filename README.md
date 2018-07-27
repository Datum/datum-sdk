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

## Documentations

[Getting Started](https://gettingstarted.datum.org/)

## Examples

[Check our examples folder.](docs/example.md)
