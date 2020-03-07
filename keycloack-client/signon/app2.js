// yes this is an express.js app
let express = require("express"),
  // I will be using passport, and the local strategy
  passport = require("passport"),
  Strategy = require("passport-local").Strategy,
  KeycloakStrategy = require("@exlinc/keycloak-passport")
  // my not so secret secret
  secret = "eeeek",
  // the single user record that is hard
  // coded in for the sake of this simple demo
  user = {
    username: "foo",
    id: 0,
    password: "123"
  },
  // will use the PORT environment variable if present,
  // else use first argument from command line for PORT,
  // else default to a hard coded value of 8080
  port = process.env.PORT || process.argv[2] || 8080,
  app = express();

// using ejs for rendering
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// using body parser to parse the body of incoming post requests
app.use(
  require("body-parser").urlencoded({
    extended: true // must give a value for extended
  })
);

import KeycloakStrategy from "@exlinc/keycloak-passport";

// using express-session for session cookies
app.use(
  require("express-session")({
    name: "site_cookie",
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // make session cookies only last 15 seconds
      // for the sake of this demo
      maxAge: 15000
    }
  })
);






passport.use(
    "keycloak",
    new KeycloakStrategy(
      {
        host: process.env.KEYCLOAK_HOST,
        realm: process.env.KEYCLOAK_REALM,
        clientID: process.env.KEYCLOAK_CLIENT_ID,
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
        callbackURL: `/api${AUTH_KEYCLOAK_CALLBACK}`
      },
      (accessToken, refreshToken, profile, done) => {
        // This is called after a successful authentication has been completed
        // Here's a sample of what you can then do, i.e., write the user to your DB
        User.findOrCreate({ email: profile.email }, (err, user) => {
          assert.ifError(err);
          user.keycloakId = profile.keycloakId;
          user.imageUrl = profile.avatar;
          user.name = profile.name;
          user.save((err, savedUser) => done(err, savedUser));
        });
      }
    )
  );
  
// using the local strategy with passport
passport.use(
  // calling the constructor given by passport-local
  new Strategy(
    // options for passport local
    {
      // using custom field names
      usernameField: "user",
      passwordField: "pass"
    },

    // login method
    function(username, password, cb) {
      if (username === user.username && password.toString() === user.password) {
        return cb(null, user);
      }

      // null and false for all other cases
      return cb(null, false);
    }
  )
);

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  cb(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

app.get("/", function(req, res) {
  res.render("index", {
    layout: "home",
    user: req.user
  });
});

app.get("/login", function(req, res) {
  res.render("views/index", {
    layout: "login",
    user: req.user
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    // redirect back to /login
    // if login fails
    failureRedirect: "/login"
  }),

  // end up at / if login works
  function(req, res) {
    res.redirect("/");
  }
);

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.listen(port, function() {
  console.log("passport-local demo up on port: " + port);
});
