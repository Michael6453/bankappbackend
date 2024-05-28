const express = require("express");
const bodyParser = require("body-parser");



const mongoConnect = require("./util/database").mongoConnect;
const usersRoutes = require("./routes/users-routes");
const adminUsersRoutes = require("./routes/admin-users-routes");
const dotenv = require("dotenv");
const HttpError = require("./models/http-error");

dotenv.config({ path: "./config.env" });


const app = express();
app.use(bodyParser.json());



app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization" 
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  
    next();
})

app.use("/api/users", usersRoutes);
app.use("/api/admin", adminUsersRoutes);

app.use((req, res, next) => {
    const error = new HttpError("Could not find this route.", 404)
    throw error
}) 

app.use((error, req, res, next) => {
 
    if (res.headerSent) {
      return next(error);
    }
    res.status(error.code || 500);  
    res.json({ message: error.message || "An unknown error occurred!" });
  }); 




mongoConnect(() => {
  app.listen(process.env.PORT || 5000);
});
