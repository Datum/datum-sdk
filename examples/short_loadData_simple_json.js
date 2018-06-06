const DatumClient = require('../src/Datum');

let client = new DatumClient();

var storageEndPoint = "http://localhost:3000/storage";

//example data
var dataId = "0xc8e2ef39a58e4d50c5d1c15fef69cede83fc815cbb99339417ab561c88002e55";

//private secret 
var secret = "Test1jöjöadsfölkjklsdajfökjakösdfkjfölöfsöf23";

//set keys
client.setPrivateKey('xxxxxxxx');
client.setPublicAddress('xxxxxxx');

//create hash of data which represent the data id
client.getSignedTimestampMessage()
.then(message => {
    request.post({
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        url: storageEndPoint + '/download',
        body: "id=" + dataId + "&signature=" + message.signature
    }, function (error, response, body) {
        return client.decryptPrivate(response.body, secret)
    });
})
.then(content => {
    console.log(content);
})
.catch((error) => {
    console.log(error);
});


