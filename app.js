require('dotenv').config() // for storing environment variables, so we can hide AP keys and encryption keys etc
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true } );
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

/////////////////////// MONGOOSE ENCRYPTION ///////////////////////////
// secret String was declared here but it has now been moved to the .env file to hide it from github etc
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = mongoose.model('User', userSchema);

app.get("/", (req, res) => {
  res.render('home');
});

/////// LOGIN chain route //////////////////
app.route("/login")
  .get((req, res) => {
    res.render('login');
  })
  .post((req, res) => {
    const name = req.body.username;
    const password = req.body.password;
    User.findOne({username: name}, (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        if (password === foundUser.password) {
          res.render('secrets');
        }
      }
    });
  });

////////////////////////////// register chain route  //////////////////
app.route("/register")
  .get((req, res) => {
    res.render('register');
  })
  .post((req, res) => {
    const name = req.body.username;
    const password = req.body.password;
    const newUser = new User({username: name, password: password});

    newUser.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.render('secrets');
      }
    });
  });

///////////////////// LOGOUT ROUTE //////////////////////////////
app.get('/logout', function(req, res) {
  res.render("home");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
