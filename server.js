'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
// creating mongoDb object
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');

let session = require('express-session');
let passport = require('passport');

const app = express();

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug')

//Middleware function to check is user pass authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}


myDB(async client => {
  const myDataBase = await client.db('database').collection('users');
  


  // Be sure to change the title
  app.route('/').get((req, res) => 
    res.render('pug', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true
    })
  );
  
  app.post('/login', 
          passport.authenticate('local', {failureRedirect: '/'}),
          function(req,res) {
            res.redirect('/profile', {username: req.user.username});
          }
  );
  
  app.get('/profile', 
          ensureAuthenticated,
          (req,res) => {
           res.render('/pug/profile')
          }
);

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
  app.use(passport.initialize());
  app.use(passport.session());  

  // serializing user using passport
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      done(null, doc);
    });
  
  });

  passport.use(new LocalStrategy(
  function(username, password, done) {
    myDataBase.findOne({ username: username }, function (err, user) {
      console.log('User '+ username +' attempted to log in.');
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (password !== user.password) { return done(null, false); }
      return done(null, user);
    });
  }
));
  
    // Be sure to add this...
}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug', { title: e, message: 'Unable to login' });
  });
});
// app.listen out here...



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
