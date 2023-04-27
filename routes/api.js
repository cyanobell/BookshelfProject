const express = require('express');
const router = express.Router();
const path = require('path');
//book api
//book show
router.get('/get_have_books', (req, res) => {
    const connection = req.app.locals.connection;
    connection.query(
        'SELECT * FROM books WHERE user_id = ?', [req.session.user_id],
        (error, books) => {
            res.json(books);
        }
    );
});

router.get('/get_user_id', (req, res) => {
    res.json({ user_id: req.session.user_id });
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
router.post('/register_book', (req, res) => {
    const connection = req.app.locals.connection;
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

function checkExistBook(book, connection ,resFunc) {
    console.log(book);
    connection.query(
        'SELECT * FROM books WHERE id = ? AND user_id = ? AND isbn = ? AND read_state = ? LIMIT 1', [book.id, book.user_id, book.isbn, book.read_state],
        (error, results, fields) => {
            resFunc(error, results.length === 1, fields);
        }
    );
}

router.post('/change_read_state', (req, res) => {
    if (req.session.user_id === undefined) {
        return;
    }
    const connection = req.app.locals.connection;
    const book = req.body.book;
    const new_read_state = req.body.new_read_state;
    if (!checkEditPermission(book, req)) {
        console.log(book.user_id + ' has no permission');
        res.json({ text: 'server error' });
        return;
    }
    checkExistBook(book, connection, (error, exist) => {
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

router.post('/delete_book', (req, res) => {
    if (req.session.user_id === undefined) {
        return;
    }
    const connection = req.app.locals.connection;
    const book = req.body.book;
    if (!checkEditPermission(book, req)) {
        res.json({ text: 'server error' });
        return;
    }
    checkExistBook(book, connection, (error, exist) => {
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

//show shared books
router.get('/get_shared_books/:shared_id', (req, res) => {
    console.log(req.params.shared_id + "is watched");
    const connection = req.app.locals.connection;
    connection.query(
        'SELECT * FROM books WHERE user_id = ?', [req.params.shared_id],
        (error, books) => {
            res.json(books);
        }
    );
});

module.exports = router;
