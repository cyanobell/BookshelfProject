'use strict';
const fs = require('fs');
const mysql = require('mysql');
const util = require('util');
const https = require('https');
const express = require('express');
const session = require('express-session');
const Logger = require('./utils/Logger');

const port = 3000;
const saltRounds = 10;
const crientDirectry = '/bookshelf_app';

const session_pass = fs.readFileSync('./.secretkeys/session_passfile', 'utf-8').trim();
const MySQLStore = require('express-mysql-session')(session);

const https_options = {
  key: fs.readFileSync('.ssh/localhost.key'),
  cert: fs.readFileSync('.ssh/localhost.crt')
}

const spl_pass = fs.readFileSync('./.secretkeys/sql_passfile', 'utf-8').trim();
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: spl_pass,
  database: 'books_app'
});

const sessionStore = new MySQLStore({
  user: 'root',
  password: spl_pass,
  database: 'books_app',
  host: 'localhost',
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,//15min
  expiration: 24 * 60 * 60 * 1000,//1day
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

const sessionConfig = {
  secret: session_pass,
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    secure: true,
    maxAge: 60 * 1000
  }
}

connection.connect((err) => {
  if (err) {
    Logger.log('Error connecting to SQL: ' + err.stack);
    return;
  }
  Logger.log('Successfully connected to SQL.');
});
connection.queryAsync = util.promisify(connection.query).bind(connection);

const app = express();

const helmet = require('helmet');
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://www.google.com", "https://api.openbd.jp"],
      scriptSrc: ["'self'", "https://unpkg.com", "https://www.google.com",  "https://www.gstatic.com", "'unsafe-inline'"],
      frameSrc: ["'self'", "https://www.google.com"],
      imgSrc: ["'self'", "data:", "https://cover.openbd.jp"],
    }
  })
);

app.use((req, res, next) => {
  req.app.locals.connection = connection;
  req.app.locals.saltRounds = saltRounds;
  req.app.locals.crientDirectry = crientDirectry;
  next();
});

app.use(session(sessionConfig));

const bodyParser = require('body-parser');
app.use(bodyParser.json());
if (app.get('env') === 'production') {
  app.set('trust proxy', 1)
  sess.cookie.secure = true
}

const { auth, requiresAuth} = require('express-openid-connect');
const auth_config = {
  authRequired: false,
  auth0Logout: true,
  secret: session_pass,
  baseURL: `https://localhost:${port}`,
  clientID: 'hBGAHxh3W9OZ5g3Bacdd3pdnJ9O85tnp',
  issuerBaseURL: 'https://dev-w2keglqi7xsd3t3z.us.auth0.com'
};

app.use(auth(auth_config));
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);
app.use(express.static(__dirname + crientDirectry));

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user, null, 2));
});


const authCallbackRoutes = require('./routes/authCallback');
const homeRoutes = require('./routes/home');
const sharedBooksRoutes = require('./routes/sharedBooks');
const apiRoutes = require('./routes/api');
const errorPageRoutes = require('./routes/errorPage');

app.use('/auth_callback', authCallbackRoutes);
app.use('/home', homeRoutes);
app.use('/shared_books', sharedBooksRoutes);
app.use('/api', apiRoutes);
app.use('/', errorPageRoutes);

https.createServer(https_options, app).listen(port, function () {
  Logger.log('App listening on port ' + port + '! Go to https://localhost:' + port + '/')
});
