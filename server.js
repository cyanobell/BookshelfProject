'use strict';
const helmet = require('helmet');
const fs = require('fs');
const express = require('express');
const mysql = require('mysql');
const util = require('util');
const bodyParser = require('body-parser');
const https = require('https');
const session = require('express-session');

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
    console.log('Error connecting to SQL: ' + err.stack);
    return;
  }
  console.log('Successfully connected to SQL.');
});
connection.queryAsync = util.promisify(connection.query).bind(connection);

const app = express();
app.use(helmet());
app.use((req, res, next) => {
  req.app.locals.connection = connection;
  req.app.locals.saltRounds = saltRounds;
  req.app.locals.crientDirectry = crientDirectry;
  next();
});

app.use(express.static(__dirname + crientDirectry));
app.use(session(sessionConfig));

app.use(bodyParser.json());
if (app.get('env') === 'production') {
  app.set('trust proxy', 1)
  sess.cookie.secure = true
}

const indexRoutes = require('./routes/index');
const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const logoutRoutes = require('./routes/logout');
const homeRoutes = require('./routes/home');
const sharedBooksRoutes = require('./routes/sharedBooks');
const apiRoutes = require('./routes/api');

app.use('/', indexRoutes);
app.use('/register', registerRoutes);
app.use('/login', loginRoutes);
app.use('/logout', logoutRoutes);
app.use('/home', homeRoutes);
app.use('/shared_books', sharedBooksRoutes);
app.use('/api', apiRoutes);

https.createServer(https_options, app).listen(port, function () {
  console.log('App listening on port ' + port + '! Go to https://localhost:' + port + '/')
});
