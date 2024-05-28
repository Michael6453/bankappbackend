const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;
const HttpError = require("../models/http-error");
const bcrypt = require("bcryptjs");

const ObjectId = mongodb.ObjectId;

class PendingUser {
  constructor(
    _id,
    username,
    email,
    password,
    country,
    address,
    occupation,
    contact,
    accountNo,
    balance,
    status
  ) {
    this._id = new ObjectId(_id) 
    this.name = username 
    this.email = email;
    this.password = password;
    this.country = country 
    this.address = address 
    this.occupation = occupation 
    this.contact = contact 
    this.accountNo = accountNo 
    this.balance = balance 
    this.status = status;
  }

  async save() {
    const db = getDb();
    let dbOp;
    try {

      console.log(`I-D ${this._id}`);
     const user = await this.deletePendingUser(this._id)
     } catch (err) {
      const error = new HttpError("Failed to remove pending user", 500)
      throw error
     }

   try {
   dbOp = await db.collection("users").insertOne(this);

   } catch (err) {
    const error = new HttpError("Failed to add user", 500)
    throw error
   }

   return dbOp
  }

  static getAllPendingUsers () {
    const db = getDb();
    return db
      .collection('pendingUsers')
      .find().toArray()
      .then(user => {
        return user;
      })
      .catch(err => {
        const error = new HttpError("Failed to find user", 500)
      throw error
      } );
  }

 static findPendingUserById (id) {
    const db = getDb();
    return db
      .collection('pendingUsers')
      .findOne({ _id: new ObjectId(id)  })
      .then(user => {
        return user;
      })
      .catch(err => {
        const error = new HttpError("Failed to find user", 500)
      throw error
      } );
  }

  deletePendingUser (id) {
    const db = getDb();
    return db
      .collection('pendingUsers')
      .deleteOne({ _id: id})
      .then(user => {
        
        return user;
      })
      .catch(err => {
        console.log ("INSTANCE")
        const error = new HttpError("Failed to delete Pending user ", 500)
      throw error
      } );
  }
}

module.exports = PendingUser;
