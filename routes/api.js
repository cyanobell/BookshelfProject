const express = require('express');
const router = express.Router();
const path = require('path');
//book api
//book show
router.get('/get_have_books', async (req, res) => {
    const connection = req.app.locals.connection;
    try {
        const books = await connection.queryAsync('SELECT * FROM books WHERE user_id = ?', [req.session.user_id]);
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving books');
    }
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
router.post('/register_book', async (req, res) => {
    const connection = req.app.locals.connection;
    if (req.session.user_id === undefined) {
        return;
    }
    const in_data = req.body;
    if (!checkIsValidISBN(in_data.isbn)) {
        res.json({ text: 'isbn is too old or wrong.' });
        return;
    }

    try {
        const books = await connection.queryAsync('SELECT * FROM books WHERE user_id = ? AND isbn = ? LIMIT 1', [req.session.user_id, in_data.isbn]);
        if (books.length !== 0) {
            res.json({ text: 'already registered' });
        } else {
            await connection.queryAsync("INSERT INTO books(user_id,isbn,read_state) VALUES (?, ?, 0)", [req.session.user_id, in_data.isbn]);
            const [lastInsert] = await connection.queryAsync("SELECT last_insert_id()");
            const lastInsertId = lastInsert['last_insert_id()'];
            res.json({
                text: 'success',
                book: {
                    id: lastInsertId,
                    user_id: req.session.user_id,
                    isbn: in_data.isbn,
                    read_state: 0
                }
            });
            console.log(in_data.isbn.toString() + ' is register');
        }
    } catch (error) {
        console.log(error);
        res.json({ text: 'error' });
    }
});

function checkEditPermission(book, req) {
    return book.user_id === req.session.user_id;
}

async function checkExistBook(book, connection) {
    console.log(book);
    const results = await connection.queryAsync(
        'SELECT * FROM books WHERE id = ? AND user_id = ? AND isbn = ? AND read_state = ? LIMIT 1', [book.id, book.user_id, book.isbn, book.read_state]
    );
    console.log(results);
    return results.length === 1;
}

router.post('/change_read_state', async (req, res) => {
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

    try {
        const exist = await checkExistBook(book, connection);
        if (!exist) {
            console.log(book.isbn + ' is not exist');
            res.json({ text: 'server error' });
            return;
        }

        await connection.queryAsync('UPDATE books SET read_state = ? WHERE id = ?', [new_read_state, book.id]);
        console.log(book.isbn + ' is state changed to ' + new_read_state);
        res.json({ text: 'success' });
    } catch (error) {
        console.error(error);
        res.json({ text: 'server error' });
    }
});

router.post('/delete_book', async (req, res) => {
    if (req.session.user_id === undefined) {
        return;
    }

    const connection = req.app.locals.connection;
    const book = req.body.book;

    if (!checkEditPermission(book, req)) {
        res.json({ text: 'server error' });
        return;
    }

    try {
        const exist = await checkExistBook(book, connection);
        if (!exist) {
            res.json({ text: 'server error' });
            return;
        }

        await connection.queryAsync('DELETE FROM books WHERE id = ?', [book.id]);
        console.log(book.isbn + ' is deleted.');
        res.json({ text: 'success' });
        return;
    } catch (error) {
        console.error(error);
        res.json({ text: 'server error' });
        return;
    }
});

//show shared books
router.get('/get_shared_books/:shared_id', async (req, res) => {
    console.log(req.params.shared_id + "is watched");
    const connection = req.app.locals.connection;
    try {
        const books = await connection.queryAsync('SELECT * FROM books WHERE user_id = ?', [req.params.shared_id]);
        res.json(books);
    } catch (error) {
        console.error(error);
        res.json({ text: 'server error' });
    }
});

module.exports = router;
