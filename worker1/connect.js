const MongoClient = require('mongodb').MongoClient;

const mongoURI = process.env.MONGOURI || "mongodb://localhost:27017/ecn";

const client = MongoClient.connect(mongoURI, { useNewUrlParser: true });

const promise = new Promise(resolve => {
    client.then(db => {
        resolve(db);
    })
})

module.exports = promise;
