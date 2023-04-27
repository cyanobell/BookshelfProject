const express = require('express');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const port = 3000;
const session_pass = fs.readFileSync('session_passfile', 'utf-8').trim();
const sess = {
  secret: session_pass,
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false,
}
const options = {
  key: fs.readFileSync('.ssh/localhost.key'),
  cert: fs.readFileSync('.ssh/localhost.crt')
};
const spl_pass = fs.readFileSync('sql_passfile', 'utf-8').trim();
const app = express();
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: spl_pass,
  database: 'books_app'
});
//throw error to terminal
connection.connect((err) => {
  if (err) {
    console.log('Error connecting to SQL: ' + err.stack);
    return;
  }
  console.log('Successfully connected to SQL.');
});
const saltRounds = 10;
const crientDirectry = '/bookshelf_app';
app.use((req, res, next) => {
  req.app.locals.connection = connection;
  req.app.locals.saltRounds = saltRounds;
  req.app.locals.crientDirectry = crientDirectry;
  next();
});

app.use(express.static(__dirname + crientDirectry));
app.use(session(sess));

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


// start HTTPS server
https.createServer(options, app).listen(port, function () {
  console.log('App listening on port ' + port + '! Go to https://localhost:' + port + '/')
});
