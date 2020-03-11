var express = require("express"),
  passport = require("passport"),
  util = require("util"),
  OpenIDStrategy = require("passport-openid").Strategy;
  var bodyParser = require('body-parser')
  var session = require('express-session')
  var Router       = require('router')

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the OpenID identifier is serialized and
//   deserialized.
passport.serializeUser(function(user, done) {
  done(null, user.identifier);
});

passport.deserializeUser(function(identifier, done) {
  done(null, { identifier: identifier });
});

// Use the OpenIDStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier), and invoke a callback
//   with a user object.
passport.use(
  new OpenIDStrategy(
    {
      returnURL: "http://localhost:3000/auth/openid/return",
      realm: "http://localhost:3000/"
    },
    function(identifier, done) {
      // asynchronous verification, for effect...
      process.nextTick(function() {
        // To keep the example simple, the user's OpenID identifier is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the OpenID identifier with a user record in your database,
        // and return that user instead.
        return done(null, { identifier: identifier });
      });
    }
  )
);

// var app = express.createServer();
var app = express();

// configure Express
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
// app.use(express.logger());
// app.use(express.cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
// app.use(express.methodOverride());
// app.use(express.session({ secret: "keyboard cat" }));
sessionMiddleware = session({
  saveUninitialized: false,
  unset: "destroy",
  secret:"g00ds3cr3t",
  resave: false,
  rolling: true,
  cookie: { maxAge: (1 * 25 * 60 * 60 * 1000) },
  name: "connect.myapp",
  // TODO -this is the wrong way to do this.... need to find a way to initiate the memory store by myself, and only than to load it to the session middlware.
  // then. we will not need to init the sessionStoreMem object
  //   store: sessionManager,
  path: "/myapp"
});
app.use(sessionMiddleware);
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

appRouter = Router();

// app.use(app.router);
appRouter.use(express.static(__dirname + "/../../public"));

appRouter.get("/", function(req, res) {
  res.render("index", { user: req.user });
});

appRouter.get("/account", ensureAuthenticated, function(req, res) {
  res.render("account", { user: req.user });
});

appRouter.get("/login", function(req, res) {
  res.render("login", { user: req.user });
});

// POST /auth/openid
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in OpenID authentication will involve redirecting
//   the user to their OpenID provider.  After authenticating, the OpenID
//   provider will redirect the user back to this application at
//   /auth/openid/return
appRouter.post(
  "/auth/openid",
  passport.authenticate("openid", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/");
  }
  );
  
  // GET /auth/openid/return
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  appRouter.get(
    "/auth/openid/return",
    passport.authenticate("openid", { failureRedirect: "/login" }),
    function(req, res) {
      res.redirect("/");
    }
    );
    
    app.get("/logout", function(req, res) {
      req.logout();
      res.redirect("/");
    });
    
    app.use(appRouter);

    var port = 3012
    console.log("listen on port: ", port)
    app.listen(3012);
    
    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.
    function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect("/login");
    }
    