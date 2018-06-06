const DatumClient = require('../src/Datum');

let client = new DatumClient();

var storageEndPoint = "http://localhost:3000/storage";

//example data
var dataExample = {
    email: "peter@example.org",
    wallet: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}

//private secret 
var secret = "Test1jöjöadsfölkjklsdajfökjakösdfkjfölöfsöf23";


//set keys
client.setPrivateKey('xxxxxxxx');
client.setPublicAddress('xxxxxxx');

//create hash of data which represent the data id
client.hash(JSON.stringify(dataExample))
.then(hash => client.encryptPrivate(JSON.stringify(dataExample), secret))
.then(encrypted => client.getSignedTimestampMessage())
.then(message => {
    request.post({
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        url: storageEndPoint + '/store',
        body: "id=" + dataHash + "&signature=" + message.signature + "&data=" + encryptedData.toString()
    }, function (error, response, body) {
        console.log(response.body);
    });
})
.catch((error) => {
    console.log(error);
});


