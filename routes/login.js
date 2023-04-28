'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    const crientDirectry = req.app.locals.crientDirectry;
    res.sendFile(path.join(__dirname, '..', crientDirectry, 'login.html'));
});

router.post('/', (req, res) => {
    const connection = req.app.locals.connection;
    const in_data = req.body;
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

module.exports = router;
