'use strict';
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
router.post('/', async (req, res) => {
    const connection = req.app.locals.connection;
    const saltRounds = req.app.locals.saltRounds;
    const in_data = req.body;
    if(!in_data.name || !in_data.pass){
        res.json({ text: 'The name or pass is empty.' });
        return;
    }
    try {
        const users = await connection.queryAsync('SELECT * FROM users WHERE name = ?', [in_data.name]);
        if (users.length !== 0) {
            res.json({ text: 'The name is already registered.' });
            return;
        }
        const hashedPassword = await bcrypt.hash(req.body.pass, saltRounds);
        await connection.queryAsync("INSERT INTO users(name, pass) VALUES (?, ?)", [in_data.name, hashedPassword]);

        const registered = await connection.queryAsync("SELECT last_insert_id()");
        const user_id = registered[0]['last_insert_id()'];
        req.session.regenerate((err) => {
            req.session.user_id = user_id;
            req.session.username = in_data.name;
            res.json({ text: 'success' });
        });
        console.log(in_data.name + ' is register');
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;
