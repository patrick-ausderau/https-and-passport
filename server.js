'use strict';

require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const express = require('express');
const app = express();

//put your username and password in .env
passport.use(new LocalStrategy(
  (username, password, done) => {
    if (username !== process.env.username || password !== process.env.password) {
      done(null, false, {message: 'Incorrect credentials.'});
      return;
    }
    return done(null, { username: username });
  }
));

//add the user in session
passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log(user);
  done(null, user);
});

app.use(session({
  secret: 'some s3cr3t value',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

//tls/ssl certificate/key for https 
//put in whatever dir you want and adapt the path
const sslkey = fs.readFileSync('../ssl-key.pem');
const sslcert = fs.readFileSync('../ssl-cert.pem')

const options = {
  key: sslkey,
  cert: sslcert
};

https.createServer(options, app).listen(3000);
//force redirection from http to https
http.createServer((req, res) => {
  res.writeHead(301, { 'Location': 'https://localhost:3000' + req.url });
  res.end();
}).listen(8080);

app.get('/', (req, res) => {
  if(req.user !== undefined)
    return res.send(`Hello ${req.user.username}!`);
  res.send('Hello Secure World!');
});

app.post('/login', 
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login.html' })
);


