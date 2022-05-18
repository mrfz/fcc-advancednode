let session = require('express-session');
let passport = require('passport');
const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github').Strategy;
const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = (app, myDataBase) => {

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
    //Using Local Strategy
    passport.use(new LocalStrategy(
      function(username, password, done) {
        myDataBase.findOne({ username: username }, function (err, user) {
          console.log('User '+ username +' attempted to log in.');
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
      function GitHubAuthProcess(accessToken, refreshToken, profile, cb) {
        console.log(profile);
      }))
}