const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const userController = require("../controllers/userController");
const GitHubStrategy = require("passport-github").Strategy;
require('dotenv').config()
const dotenv = require("dotenv")
const db = require("db")

const localLogin = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  (email, password, done) => {
    const user = userController.getUserByEmailIdAndPassword(email, password);
    return user
      ? done(null, user)
      : done(null, false, {
          message: "Your login details are not valid. Please try again",
        });
  }
);

const gitLogin = new GitHubStrategy(
  
  db.connect({
    clientID: dotenv.DB_ID,
    clientSecret: dotenv.DB_SECRET,
    callbackURL: dotenv.DB_WEB
  })
  ,
  function(accessToken, refreshToken, profile, cb) {
    user = userController.findOrCreate({ githubId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
)

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  let user = userController.getUserById(id);
  if (user) {
    done(null, user);
  } else {
    done({ message: "User not found" }, null);
  }
});

module.exports = passport.use(localLogin), passport.use(gitLogin);
