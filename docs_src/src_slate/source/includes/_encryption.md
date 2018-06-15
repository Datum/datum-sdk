# Encryption

Datum values the security of user’s data first. The diagram below highlights the procedure on how to secure the data. The box represents a block on the blockchain and the data is encrypted
with two layers.

![](encryptionP.png)

The prepareData method allows for a random secret to be generated and be encrypted with public key from owner.

>PrepareData

```javascript

const Datum = require('datum-sdk');

let datum = new Datum("https://node-us-west.datum.org/api", "https://node-eu-west.datum.org/storage", [privateKey]);

var data = datum.prepareData('{"userId":1,"id":1,"title":"sunt aut facere repellat provident occaecati excepturi optio reprehenderit","body":"quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto"}');

```


