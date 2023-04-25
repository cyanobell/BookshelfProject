const express = require('express');
const fs = require('fs');
const bcrypt = require("bcrypt");
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const port = 3000;
const saltRounds = 10;
const crientDirectry = '/bookshelf_app';
const session_pass = fs.readFileSync('session_passfile', 'utf-8').trim();
const sess = {
  secret: session_pass,
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false,
}
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

app.use(express.static(__dirname + crientDirectry));
app.use(session(sess));

app.use(bodyParser.json());
if (app.get('env') === 'production') {
  app.set('trust proxy', 1)
  sess.cookie.secure = true
}

//open home
app.get('/home', (req, res) => {
  if (req.session.username !== undefined) {
    console.log(req.session.username + ' is home');
    res.sendFile(path.join(__dirname, crientDirectry, 'home.html'));
  } else {
    res.redirect('/');
  }
});

//logout
app.get('/logout', (req, res) => {
	req.session.regenerate((err) => {
	  req.session.user_id = undefined;
	  req.session.username = undefined;
    res.redirect('/');
	});
});

//open index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, crientDirectry, 'index.html'));
});

//show login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, crientDirectry, 'login.html'));
});


//posted logininput 
app.post('/login', (req, res) => {
  const in_data = req.body;
  //login attestation
  connection.query('SELECT * FROM users', async (error, users) => {
    let login_success = false;
    for (const user of users) {
      let pass_compare_rlt = await bcrypt.compare(in_data.pass, user.pass);
      if (in_data.name === user.name && pass_compare_rlt) {
        req.session.regenerate((err) => {
          req.session.user_id = user.id;
          req.session.username = user.name;
          res.json({ text: 'success' });
        });
        console.log(user.name + ' is login');
        login_success = true;
        return;
      }
    };
    if (!login_success) {
      res.json({ text: 'user or password is wrong' });
      console.log("login failed");
      console.log(req.body);
    }
  });
});

//show register
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, crientDirectry, 'register.html'));
});

//posted register input 
app.post('/register', (req, res) => {
  const in_data = req.body;

  connection.query(
    'SELECT * FROM users',
    async (error, users) => {
      let is_already_registered = false;
      for (const user of users) {
        if (in_data.name === user.name) {
          res.json({ text: 'The name is already registered.' });
          is_already_registered = true;
          return;
        }
      };
      if (is_already_registered) {
        return;
      }

      let hashedPassword = await bcrypt.hash(req.body.pass, saltRounds);
      connection.query(
        "INSERT INTO users(name, pass) VALUES (?, ?)", [in_data.name, hashedPassword],
        (error, result) => {
          connection.query("SELECT last_insert_id()",
          (error, results) => {
            let user_id = results[0]['last_insert_id()'];
            req.session.regenerate((err) => {
              req.session.user_id = user_id;
              req.session.username = in_data.name;
              res.json({ text: 'success' });
            });
            console.log(in_data.name+ ' is register');
          }
        );}
      );
    }
  );
});



//book api
//book show
app.post('/api/get_have_books', (req, res) => {
  console.log(req.session.user_id);
  connection.query(
    'SELECT * FROM books WHERE user_id = ?', [req.session.user_id],
    (error, books) => {
      console.log(books);
      res.json(books);
    }
  );
});


function checkIsValidISBN(isbn_str) {
  //ｰ>デバッグ用。どんな番号でも許可するreturn isbn_str.length !== 0;
  //現状古い規格は非対応
  if (isbn_str.length != 13) {
    return false;
  }
  //現状古い規格は非対応
  if (isbn_str[0] != '9' && isbn_str[1] != '7') {
    return false;
  }
  const check_digit = parseInt(isbn_str.slice(-1)); // バーコードからチェックディジットを抽出する
  const barcode_digits = isbn_str.slice(0, -1).split(""); // チェックディジットを除いたバーコードの桁を抽出する

  //チェックデジットと照らし合わせる数字を生成
  let sum = 0;
  for (let i = 0; i < barcode_digits.length; i++) {
    if (i % 2 === 0) {
      sum += parseInt(barcode_digits[i]); // 奇数桁を足す
    } else {
      sum += 3 * parseInt(barcode_digits[i]); // 偶数桁を3倍する
    }
  }

  //チェックデジットと照らし合わせる
  if ((sum + check_digit) % 10 === 0) {
    return true;
  } else {
    console.log("Barcode error: " + sum + check_digit);
    return false;
  }
}

//book register
app.post('/api/register_book', (req, res) => {
  if (req.session.user_id === undefined) {
    return;
  }
  const in_data = req.body;
  if (!checkIsValidISBN(in_data.isbn)) {
    res.json({ text: 'isbn is too old or wrong.' });
    return;
  }

  //本が登録されてないときのみ登録。
  //本を挿入し、挿入したデータをクライアントに返します。
  connection.query(
    'SELECT * FROM books WHERE user_id = ? AND isbn = ? LIMIT 1', [req.session.user_id, in_data.isbn],
    (error, books) => {
      if (books.length !== 0) {
        res.json({ text: 'already registered' });
      } else {
        connection.query(
          "INSERT INTO books(user_id,isbn,read_state) VALUES (?, ?, 0)", [req.session.user_id, in_data.isbn],
          (error, results) => {
            connection.query("SELECT last_insert_id()",
              (error, results) => {
                console.log(results[0]['last_insert_id()']);
                res.json({
                  text: 'success',
                  book: {
                    id: results[0]['last_insert_id()'],
                    user_id: req.session.user_id,
                    isbn: in_data.isbn,
                    read_state: 0
                  }
                });
                console.log(in_data.isbn.toString() + ' is register');
              }
            );
          }
        );
      }
    });
});

function checkEditPermission(book, req) {
  return book.user_id === req.session.user_id;
}

function checkExistBook(book, resFunc) {
  console.log(book);
  connection.query(
    'SELECT * FROM books WHERE id = ? AND user_id = ? AND isbn = ? AND read_state = ? LIMIT 1', [book.id, book.user_id, book.isbn, book.read_state],
    (error, results, fields) => {
      resFunc(error, results.length === 1, fields);
    }
  );
}

app.post('/api/change_read_state', (req, res) => {
  if (req.session.user_id === undefined) {
    return;
  }
  const book = req.body.book;
  const new_read_state = req.body.new_read_state;
  if (!checkEditPermission(book, req)) {
    console.log(book.user_id + ' has no permission');
    res.json({ text: 'server error' });
    return;
  }
  checkExistBook(book, (error, exist) => {
    if (!exist) {
      console.log(book.isbn + ' is not exist');
      res.json({ text: 'server error' });
      return;
    }
    connection.query(
      'UPDATE books SET read_state = ? WHERE id = ?', [new_read_state, book.id],
      (error, results) => {
        console.log(book.isbn + ' is state changed to ' + new_read_state);
        res.json({ text: 'success' });
        return;
      }
    );
  });
});

app.post('/api/delete_book', (req, res) => {
  if (req.session.user_id === undefined) {
    return;
  }
  const book = req.body.book;
  if (!checkEditPermission(book, req)) {
    res.json({ text: 'server error' });
    return;
  }
  checkExistBook(book, (error, exist) => {
    if (!exist) {
      res.json({ text: 'server error' });
      return;
    }
    connection.query(
      'DELETE FROM books WHERE id = ?', [book.id],
      (error, results) => {
        console.log(book.isbn + ' is deleted.');
        res.json({ text: 'success' });
        return;
      }
    );
  });
});

app.get('/shared_books/:shared_id', (req, res) => {
  res.sendFile(path.join(__dirname, crientDirectry, 'readOnly.html'));
});


//show shared books
app.get('/api/get_shared_books/:shared_id', (req, res) => {
  console.log(req.params.shared_id );
  connection.query(
    'SELECT * FROM books WHERE user_id = ?', [req.params.shared_id ],
    (error, books) => {
      console.log(books);
      res.json(books);
    }
  );
});


//listen port
app.listen(port, () => {
  console.log("My app listening on port " + port + " !");
});


