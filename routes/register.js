const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');

//show register
router.get('/', (req, res) => {
    const crientDirectry = req.app.locals.crientDirectry;
    res.sendFile(path.join(__dirname, '..', crientDirectry, 'register.html'));
});

//posted register input 
router.post('/', (req, res) => {
    const connection = req.app.locals.connection;
    const saltRounds = req.app.locals.saltRounds;
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
                            console.log(in_data.name + ' is register');
                        }
                    );
                }
            );
        }
    );
});

module.exports = router;
