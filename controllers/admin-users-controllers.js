const PendingUser = require("../models/admin");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const HttpError = require("../models/http-error");


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port:465,
  secure: true,
  auth: {
    user: "preciousebere090@gmail.com",
    pass:'zmagxmiweavhkuwz'
  }
}
);

const getUsers = async (req, res, next) => {
  let allUsers;
  try {
    allUsers = await User.getAllUsers();
  } catch (err) {
    const error = new HttpError(
      err.message,
      500
    );
  }

  if (!allUsers) {
    return next(new HttpError("An error occured", 404));
  }

  res.status(200);
  res.json({ message: "success", users: allUsers });
};


const getUserById = async (req, res, next) => {
  const uid = req.params.uid;
  let user
  try {
    user = await User.findUserById(uid)
  } catch (err) {
    const error = new HttpError(
        err.message,
        500
      );
      return next(error);
  }

if (!user) {
    const error = new HttpError(
      'Could not find user',
      404
    );
    return next(error);
  }

  res.status(200);
  res.json({ message: "success", userData: user });
};



const addPendingUsers = async (req, res, next) => {
  const {
    _id,
    name,
    email,
    password,
    country,
    address,
    occupation,
    contact,
    accountNo,
    balance,
    status,
  } = req.body;

  const pending = new PendingUser(
    _id,
    name,
    email,
    password,
    country,
    address,
    occupation,
    contact,
    accountNo,
    balance,
    status
  );

  try {
    await pending.save();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }
  res.status(200);
  res.json({ message: "success" });

  try { 
    transporter.sendMail({ 
       to: pending.email, 
       from: 'dev@gmail.com',
       subject: 'Account Approved',
       html: `<h3>Congratulations! Your account has been approved.<br /> You can now log-in  </h3>`
     }); 
   } catch (err) {
     next()
   }
};

const getPendingUsers = async (req, res, next) => {
  let allPendingUsers;
  try {
    allPendingUsers = await PendingUser.getAllPendingUsers();
  } catch (err) {
    const error = new HttpError(
      "Fetching pendingUser failed, please try again.",
      500
    );
  } 

  if (!allPendingUsers) {
    return next(new HttpError("An error occured", 404));
  }

  res.status(200);
  res.json({ message: "success", pendingUsers: allPendingUsers });
};


const getPendingUserById = async (req, res, next) => { 
  const pid = req.params.pid;
  let user
  try {
    user = await PendingUser.findPendingUserById(pid)
  } catch (err) {
    const error = new HttpError(
        err.message,
        500
      );
      return next(error);
  }

if (!user) {
    const error = new HttpError(
      'Could not find user',
      404
    );
    return next(error);
  }

  res.status(200);
  res.json({ message: "success", userData: user });
};


exports.getUsers =  getUsers;
exports.getUserById = getUserById;
exports.getPendingUsers = getPendingUsers;
exports.getPendingUserById = getPendingUserById;
exports.addPendingUsers = addPendingUsers;
