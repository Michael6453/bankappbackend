const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aef170i.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`  
  )  
    .then((client) => {
      console.log("CONNECTED");
      _db = client.db(); 
      callback(); 
    })
    .catch((err) => {
      console.log(err);
      console.log("ERROR CONNECTING TO DATABASE");
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No Database Found";
};

exports.mongoConnect = mongoConnect
exports.getDb = getDb
