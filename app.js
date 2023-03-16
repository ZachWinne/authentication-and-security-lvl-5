require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.static('public'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded( {extended: true} ));

const ejs = require('ejs');
app.set('view engine', 'ejs');

const bcrypt = require('bcrypt');

const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

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
      bcrypt.compare(req.body.password, foundUser.password)
      .then( (matching) => {
        if (matching) {
          res.render('secrets');
        }
        else {
          res.redirect('/login')
        }
      })
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

    bcrypt.hash(req.body.password, 10)
    .then( (hash) => {
      const newUser = new User({
        email: req.body.username,
        password: hash
      });

      newUser.save()
      .then( () => {
        res.render('secrets');
      })
      .catch( (err) => {
        console.log(err);
      });
    })

    .catch( (err) => {
      console.log(err);
    })
  });



app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port ' + (process.env.PORT || 3000) + '...');
});