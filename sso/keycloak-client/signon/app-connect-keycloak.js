
'use strict';

const Keycloak = require('keycloak-connect');
const express = require('express');
const session = require('express-session');
const expressHbs = require('express-handlebars');

const app = express();

const port = process.env.PORT;

// Register 'handelbars' extension with The Mustache Express
app.engine('hbs', expressHbs({extname:'hbs',
  defaultLayout:'layout.hbs',
  relativeTo: __dirname}));
app.set('view engine', 'hbs');


var memoryStore = new session.MemoryStore();
var keycloak = new Keycloak({ store: memoryStore });

//session
app.use(session({
  secret:'thisShouldBeLongAndSecret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

app.use(keycloak.middleware());

//route protected with Keycloak
app.get('/protected', keycloak.protect(), function(req, res){
//   res.render('test', {title:'Test of the test'});
    res.status(200).send({ msg: "protected successful" });
});

//unprotected route
app.get('/',function(req,res){
  res.status(200).send({ msg: "unprotected successful" });
});

app.use( keycloak.middleware( { logout: '/logout'} ));

app.listen(port, function () {
  console.log(`Listening at http://localhost:${port}`);
});