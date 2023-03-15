require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.static('public'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded( {extended: true} ));

const ejs = require('ejs');
app.set('view engine', 'ejs');

const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption')

mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]} );

const User = mongoose.model('User', userSchema);



app.get('/', (req, res) => {
  res.render('home')
})

app.route('/login')
  .get( (req, res) => {
    res.render('login')
  })

  .post( (req, res) => {
    User.findOne({
      email: req.body.username
    })
    .then( (foundUser) => {
      if (foundUser.password === req.body.password) {
        res.render('secrets');
      }
      else {
        res.redirect('/login')
      }
    })
    .catch( (err) => {
      console.log(err);
    });
  });

app.route('/register')

  .get( (req, res) => {
    res.render('register')
  })

  .post( (req, res) => {
    const newUser = new User({
      email: req.body.username,
      password: req.body.password
    });

    newUser.save()
    .then( () => {
      res.render('secrets');
    })
    .catch( (err) => {
      console.log(err);
    });
  });



app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port ' + (process.env.PORT || 3000) + '...');
});