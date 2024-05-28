const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;
const HttpError = require("../models/http-error");
const bcrypt = require("bcryptjs");

const ObjectId = mongodb.ObjectId;

class User {
  constructor(
    username,
    email,
    password,
    country,
    address, 
    occupation,
    contact  
  ) {
    this.name = username ? username : null;
    this.email = email;
    this.password = password;
    this.country = country ? country : null;
    this.address = address ? address : null; 
    this.occupation = occupation ? occupation : null;
    this.contact = contact ? contact : null;
    this.status = "user";
  }
 
  async save() {
    const db = getDb();
    let dbOp;
    let userExist;
    let userPending;
   
    
    if (this.name) {
      try {
        userExist = await this.existingUser(this.email)
      } catch (err) {
        const error = new HttpError(err.message, err.code)
        throw error
      }
      
      try {
        userPending = await this.userPending(this.email)
      } catch (err) {
        const error = new HttpError(err.message, err.code)
        throw error
      }
      
      
      if (userExist) {
          dbOp = new Promise((resolve, reject) => {
            const data = {
              message: "A user with this profile already exist",
              operationStatus: "faild",
              code: 401,
            };
            resolve(data);
          });
          
      }

      console.log(userExist);
      
      if (userPending) {
        try {
          console.log("SIGN-UP BLOCK");
            dbOp = new Promise((resolve, reject) => {
              const data = {
                message: "your application is still pending",
                operationStatus: "failed",
                code: 401,
              };
              resolve(data);
            });
        }catch(err) {}
        }
        
        if (!userExist && !userPending) {
          dbOp = db.collection("pendingUsers").insertOne(this);
      }
      // sign me up
    } else {
      console.log("LOG-IN BLOCK");
      try {
        userExist = await this.existingUser(this.email)
      } catch (err) {
        const error = new HttpError(err.message, err.code)
        throw error
      }
      
      try {
        userPending = await this.userPending(this.email)
      } catch (err) {
        const error = new HttpError(err.message, err.code)
        throw error
      }

      if (userPending) {
        dbOp = new Promise((resolve, reject) => {
          const data = {
            message: "your application is still pending",
            operationStatus: "faild",
            code: 401,
          };
          resolve(data);
        });
      }
      if (userExist) {
        dbOp = db.collection("users").find({ email: this.email }).next();
      }

      if (!userExist && !userPending) {
        dbOp = new Promise((resolve, reject) => {
          const data = {
            message: "No user with this profile, Sign-Up!",
            operationStatus: "faild",
            code: 401,
          };
          resolve(data);
        });
      }
    }

    return dbOp
      .then((result) => {
        return result
      })
      .catch((error) => {
        const err = new HttpError("Server-Timeout", 500);
        console.log(error);
      });
  }
  existingUser (email) {
    const db = getDb();
    return db
      .collection('users')
      .find({ email: email })
      .next()
      .then(user => {
        return user;
      })
      .catch(err => {
        console.log(err);
        const error = new HttpError("failed to confirm existing user", 500)
        throw error
      } );
  }

  userPending (email) {
    const db = getDb();
    return db
      .collection('pendingUsers')
      .find({ email: email })
      .next()
      .then(user => {
        
        return user;
      })
      .catch(err => {
        console.log(err);
        const error = new HttpError("failed to confirm pending user", 500)
        throw error
      } );
  }



  static getAllUsers () {
    const db = getDb();
    return db
      .collection('users')
      .find().toArray()
      .then(user => {
        return user;
      })
      .catch(err => {
        const error = new HttpError("Failed to fetch users", 500)
      throw error
      } );
  }

 static findUserById (id) {
    const db = getDb();
    return db
      .collection('users')
      .findOne({ _id: new ObjectId(id)  })
      .then(user => {
        return user;
      })
      .catch(err => {
        const error = new HttpError("Failed to find user", 500)
      throw error
      } );
  }

 static deleteUser (id) {
    const db = getDb();
    return db
      .collection('users')
      .deleteOne({ _id: id })
      .then(user => {
        
        return user;
      })
      .catch(err => {
        const error = new HttpError("Failed to delete user", 500)
      throw error
      } );
  }
}

module.exports = User;
