'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    const crientDirectry = req.app.locals.crientDirectry;
    res.sendFile(path.join(__dirname, '..', crientDirectry, 'login.html'));
});

router.post('/', async (req, res) => {
    const connection = req.app.locals.connection;
    const in_data = req.body;
    if(!in_data.name || !in_data.pass){
        res.json({ text: 'The name or pass is empty.' });
        return;
    }
    try {
        const users = await connection.queryAsync('SELECT * FROM users WHERE name = ?', [in_data.name]);
        if (users.length !== 1 || !bcrypt.compare(in_data.pass, users[0].pass)) {
            res.json({ text: 'user or password is wrong' });
            console.log("login failed");
            console.log(req.body);
            return;
        }

        const user = users[0];
        console.log(user.name + ' is login');
        req.session.regenerate((err) => {
            if (err) {
                console.error(err);
            }
            req.session.user_id = user.id;
            req.session.username = user.name;
            res.json({ text: 'success' });
        });

    } catch (error) {
        console.error(error);
    }
});

module.exports = router;
