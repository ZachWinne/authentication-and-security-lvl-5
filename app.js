require('dotenv').config();

// requiring packages
const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded( {extended: true} ));

app.use(session({
  secret: "This is the secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


// mongoose npm package setup
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// setting up passport-local-mongoose
userSchema.plugin(passportLocalMongoose);


const User = mongoose.model('User', userSchema);


// setting up passport-local configs
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', (req, res) => {
  res.render('home');
})


app.get('/login', (req, res) => {
  res.render('login');
})

app.post('/login', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.passport
  });

  req.login(user, (err) => {
    if (!err) { 
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secrets');
      });
    }
    else {
      console.log(err);
      res.redirect('/login');
    }
  });
});


app.get('/register', (req, res) => {
  res.render('register');
});


// allows for registered and authenticated users to access the /secrets page directly (uses passport generated cookies)
app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('secrets');
  }
  else {
    res.redirect('/login');
  }
});


app.get('/logout', (req, res) => {
  req.logout( (err) => {
    if (!err) {
      res.redirect('/');
    }
    else {
      console.log(err);
    }
  });
})


app.post('/register', (req, res) => {

  User.register({username: req.body.username}, req.body.password, (err, user) => {
    if (!err) {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secrets')
      })
    }
    else {
      console.log(err);
      res.redirect('/register')
    }
  });
});



app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port ' + (process.env.PORT || 3000) + '...');
});