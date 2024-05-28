const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const getDb = require("../util/database").getDb;
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "preciousebere090@gmail.com",
    pass: process.env.APP_PASS
  }
}
);

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const username = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const country = req.body.country;
  const address = req.body.address;
  const occupation = req.body.occupation;
  const contact = req.body.contact;

  console.log("PASS " + password);

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }

  const createdUser = new User(
    username,
    email,
    hashedPassword,
    country,
    address,
    occupation,
    contact
  );

  let user;
  try {
    user = await createdUser.save(); 
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (user.operationStatus) {
    const error = { ...user };
    console.log(error);
    next(error);
  }



  res.status(201).json({
    message: "success", 
    userId: user.insertedId, 
    email: createdUser.email
  });

  // try {
  //   transporter.sendMail({
  //     to: createdUser.email,
  //     from: 'dev@gmail.com',
  //     subject: 'Signup succeeded!',
  //     html: `<h3>Thank you for signing up! <br /> Your credentials have been submitted and are currently under review. <br /> We'll be in touch soon to let you know once your account has been approved. Please check your email for updates.<br /> Thank you for your patience!</h3>`
  //   });
  // } catch (err) {  
  //   next()
  // }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const db = getDb()

  let adminUser;
  if (password === process.env.ADMIN_PASS) {
    // get adminUser
    try {
      adminUser = await db.collection("adminUsers").findOne({ email: email })
    } catch (err) {
      const error = HttpError("Login Failed", 422)
      return next(error)
    } 
  }
  if (adminUser) {

    let adminToken;
    try {
      adminToken = jwt.sign(
        { userId: adminUser._id.toString(), email: adminUser.email },
        process.env.ADMIN_JWT_KEY,
        { expiresIn: "1h" }
      );
    } catch (err) { 
      const error = new HttpError(
        "Login failed, please try again later.",
        500
      );    
      return next(error);
    }
    // 1. generate token 
    //  2. send email
    return res.status(200).json({
      message: "success", token: adminToken, user: {
        userId: adminUser._id.toString(),
        name: adminUser.name,
        status: adminUser.status
      }
    })
  }


  const loginUser = new User(null, email, password, null, null, null, null);

  let user; 
  try {
    user = await loginUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (user.operationStatus) {
    const error = { ...user };
    return next(error);
  }

  let isValidPassword = false; 
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }
 
  if (!isValidPassword) {
    const error = new HttpError( 
      "Invalid credentials, could not log you in.",
      403
    ); 
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(200)
  res.json({
    user: {
      userId: user._id.toString(),
      name: user.name,
      accountNo: user.accountNo,
      balance: user.balance,
      status: user.status
    },
    token: token,
  });

  try {
    transporter.sendMail({
      to: user.email,
      from: 'dev@gmail.com',
      subject: 'Login successful!',
      html: `<h1>You successfully logged-in!!!</h1>`
    });
  } catch (err) {
    next()
  }
};

exports.signup = signup;
exports.login = login;
