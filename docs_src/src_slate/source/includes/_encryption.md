# Encryption

Datum values the security of user’s data first. The diagram below highlights the procedure on how to secure the data. The box represents a block on the blockchain and the data is encrypted
with two layers.

![](encryptionP.png)

The prepareData method allows for a random secret to be generated and be encrypted with public key from owner.

>PrepareData

```javascript

var data = datum.prepareData('123');

```


