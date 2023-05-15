'use strict';
const express = require('express');
const router = express.Router();
const isLoginFilter = require('../filter/isLoginFilter');

router.use('/get_have_books', isLoginFilter);
router.get('/get_have_books', async (req, res) => {
  const connection = req.app.locals.connection;
  const user_id = req.session.user_id;
  try {
    const books = await connection.queryAsync('SELECT * FROM books WHERE user_id = ?', [user_id]);
    res.status(200).json(books);
  } catch (error) {
    console.error("asdf");
    console.error(error.message);
    res.status(500).send('server error');
  }
});

router.get('/get_shared_books/:shared_id', async (req, res) => {
  const connection = req.app.locals.connection;
  const user_shared_id = req.params.shared_id;
  try {
    const users = await connection.queryAsync('SELECT * FROM users WHERE shareing_seed = ? LIMIT 1', [user_shared_id]);
    if (users.length === 0) {
      console.log(`${user_shared_id} is not found`);
      res.status(404).send('user id is not found');
      return;
    }
    const books = await connection.queryAsync('SELECT * FROM books WHERE user_id = ?', [users[0].id]);
    res.status(200).json(books);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
  }
});

router.get('/get_user_name_to_id/:shared_id', async (req, res) => {
  const connection = req.app.locals.connection;
  const user_shared_id = req.params.shared_id;
  try {
    const users = await connection.queryAsync('SELECT * FROM users WHERE shareing_seed = ?', [user_shared_id]);
    if (users.length === 0) {
      console.log(`${user_shared_id} is not found`);
      res.status(404).send('user id is not found');
      return;
    }
    res.status(200).json({user_name: users[0].name});
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
  }
});

router.use('/get_user_id', isLoginFilter);
router.get('/get_user_id', (req, res) => {
  res.status(200).json({ user_id: req.session.user_id });
});

function checkIsValidISBN(isbn_str) {
  //現状古い規格は非対応
  if (isbn_str.length != 13) {
    return false;
  }
  //現状古い規格は非対応
  if (isbn_str[0] != '9' || isbn_str[1] != '7') {
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
    return false;
  }
}

router.use('/register_book', isLoginFilter);
router.post('/register_book', async (req, res) => {
  const connection = req.app.locals.connection;
  const { isbn } = req.body;
  if (!checkIsValidISBN(isbn)) {
    console.log("isbn error: " + isbn);
    res.status(400).send('isbn is too old or wrong');
    return;
  }

  try {
    const books = await connection.queryAsync('SELECT * FROM books WHERE user_id = ? AND isbn = ? LIMIT 1', [req.session.user_id, isbn]);
    if (books.length !== 0) {
      res.status(409).send('book is already exist');
      console.log(isbn + ' is already registered');
    } else {
      await connection.queryAsync("INSERT INTO books(user_id,isbn,read_state) VALUES (?, ?, 0)", [req.session.user_id, isbn]);
      const [lastInsert] = await connection.queryAsync("SELECT last_insert_id()");
      const lastInsertId = lastInsert['last_insert_id()'];
      res.status(201).json({
        id: lastInsertId,
        user_id: req.session.user_id,
        isbn: isbn,
        read_state: 0
      });
      console.log(isbn + ' is register');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('server error');
  }
});

function checkEditPermission(book, req) {
  return book.user_id === req.session.user_id;
}

async function checkExistBook(book, connection) {
  const results = await connection.queryAsync(
    'SELECT * FROM books WHERE id = ? AND user_id = ? AND isbn = ? AND read_state = ? LIMIT 1', [book.id, book.user_id, book.isbn, book.read_state]
  );
  return results.length === 1;
}

router.use('/change_read_state', isLoginFilter);
router.post('/change_read_state', async (req, res) => {
  const connection = req.app.locals.connection;
  const book = req.body.book;
  const new_read_state = req.body.new_read_state;
  if (!checkEditPermission(book, req)) {
    console.log(`${req.session.user_id} try edit to ${book.user_id}`);
    res.status(401).send('has not permission');
    return;
  }

  try {
    const exist = await checkExistBook(book, connection);
    if (!exist) {
      console.log(`${book.isbn} is not exist`);
      res.status(400).send('book is not exist');
      return;
    }

    connection.queryAsync('UPDATE books SET read_state = ? WHERE id = ?', [new_read_state, book.id]);
    console.log(book.isbn + ' is state changed to ' + new_read_state);
    res.status(202).json({
      id: book.id,
      user_id: book.user_id,
      isbn: book.isbn,
      read_state: new_read_state
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
  }
});

router.use('/delete_book', isLoginFilter);
router.post('/delete_book', async (req, res) => {
  const connection = req.app.locals.connection;
  const book = req.body.book;

  if (!checkEditPermission(book, req)) {
    console.log(`${req.session.user_id} try edit to ${book.user_id}`);
    res.status(401).send('has not permission');
    return;
  }

  try {
    const exist = await checkExistBook(book, connection);
    if (!exist) {
      console.log(book.isbn + ' is not exist');
      res.status(400).send('book is not exist');
      return;
    }

    await connection.queryAsync('DELETE FROM books WHERE id = ?', [book.id]);
    console.log(book.isbn + ' is deleted.');
    res.status(202).send();
    return;
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
    return;
  }
});

router.use('/get_user_shareing_id', isLoginFilter);
router.get('/get_user_shareing_id', async (req, res) => {
  const connection = req.app.locals.connection;
  const { user_id } = req.session;
  try {
    const users = await connection.queryAsync('SELECT * FROM users WHERE id = ? LIMIT 1', [user_id]);

    res.status(200).json({user_shareing_id: users[0].shareing_seed});
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
    return;
  }
});

module.exports = router;
