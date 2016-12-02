var passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
Passwords = require('machinepack-passwords');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findOne({ id: id } , function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {

    User.findOne({ email: email }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      Passwords.checkPassword({
        passwordAttempt: password,
        encryptedPassword: user.password,
        }).exec({
        // An unexpected error occurred.
            error: function (err){
                return done(null, false, { message: err});
            },
            // Password attempt does not match already-encrypted version
            incorrect: function (){
                return done(null, false, { message: 'Invalid Password'});
            },
            // OK.
            success: function (){
                var returnUser = {
                    email: user.email,
                    createdAt: user.createdAt,
                    id: user.id
                };
                return done(null, returnUser, { message: 'Logged In Successfully' });
            },
        });             
    });
  }
));