//Authorization module.

const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');

const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github').Strategy;

require('dotenv').config();

module.exports = (app, myDataBase) => {

  // serializing and deserializing user using passport 
  // serializing is for storing user sessions over time
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      done(null, doc);
    });

  });


  //Using Local Strategy, bcrypt for checking password
  passport.use(new LocalStrategy(
    function(username, password, done) {
      console.log("local strategy started");
      myDataBase.findOne({ username: username }, function(err, user) {
        console.log('User ' + username + ' attempted to log in.');
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false);
        }
        return done(null, user);
      });
    }
  ));
  //Using github strategy
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://fcc-advancednode.mrfz.repl.co/auth/github/callback"
  },
    function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
      myDataBase.findOneAndUpdate(
        { id: profile.id },
        {
          $setOnInsert: {
            id: profile.id,

            name: profile.displayName || 'John Doe',
            photo: profile.photos[0].value || '',
            email: Array.isArray(profile.emails)
              ? profile.emails[0].value
              : 'No public email',
            created_on: new Date(),
            provider: profile.provider || ''
          },
          $set: {
            last_login: new Date()
          },
          $inc: {
            login_count: 1
          }
        },
        { upsert: true, new: true },
        (err, doc) => {
          return cb(null, doc.value);
        }
      );
    }))
}