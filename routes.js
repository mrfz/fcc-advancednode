let session = require('express-session');
let passport = require('passport');

module.exports = function (app, myDataBase ) {
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }
  
  app.route('/').get((req, res) => 
    res.render('pug', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true
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

  app.get('/logout',
      (req, res) => {
        req.logout();
        res.redirect('/');
      }
  );
  
   app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
    });

  app.route('/register')
  .post((req, res, next) => {
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

  app.get('/auth/github',
         passport.authenticate('github'));

  app.get('/auth/github/callback',
         passport.authenticate('github', { failureRedirect: '/' }),
         (req, res) => res.redirect('/profile'));
}