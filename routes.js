const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');

require('dotenv').config();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = function(app, myDataBase) {

  // index page render
  app.get('/', (req, res) =>
    res.render('pug', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true
    })
  );

// local authentication route
  app.post('/login',
    passport.authenticate('local', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/chat'); //trying to get straight to chat 
    }
  );

  //route to profile with middleware to check if user had been authenticated earlier
  app.get('/profile',
    ensureAuthenticated,
    (req, res) => {
      res.render(process.cwd() + '/views/pug/profile', { username: req.user.username });
    }
  );

  app.get('/logout',
    (req, res) => {
      req.logout();
      res.redirect('/');
    }
  );

// registration with hashing user password by bcrypt
  app.post('/register', (req, res, next) => {
    myDataBase.findOne({ username: req.body.username }, function(err, user) {
      if (err) {
        next(err);
      } else if (user) {
        res.redirect('/');
      } else {
        const hash = bcrypt.hashSync(req.body.password, 12);
        myDataBase.insertOne({
          username: req.body.username,
          password: hash
        },
          (err, doc) => {
            if (err) {
              res.redirect('/');
            } else {
              // The inserted document is held within
              // the ops property of the doc
              next(null, doc.ops[0]);
            }
          }
        )
      }
    })
  },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );
  
// github startegy routes, first for call, second for callback. for now i cant see user name in profile using this strategy

  app.get('/auth/github', passport.authenticate('github'));

  app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {req.session.user_id = req.user.id; res.redirect('/chat')}
  );

  //route to chat page
  app.get('/chat',
         ensureAuthenticated,
         (req,res) => res.render(process.cwd() + '/views/pug/chat', { username: req.user })
  );

// 404 route
  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Page Not Found');
  });
}