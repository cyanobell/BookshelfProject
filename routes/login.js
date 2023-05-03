'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');

const fs = require('fs');
const secretKey = fs.readFileSync('.secretkeys/google_reCAPTCHA', 'utf-8').trim();
const reCaptchaSubmit = require('./reCaptchaSubmit.js');

router.get('/', (req, res) => {
    const crientDirectry = req.app.locals.crientDirectry;
    res.sendFile(path.join(__dirname, '..', crientDirectry, 'login.html'));
});

router.post('/', async (req, res) => {
    const connection = req.app.locals.connection;
    const in_data = req.body;
    if(req.session.reCaptchaToken === undefined){
        if (await reCaptchaSubmit(secretKey, req.body.recaptchaResponse) === false) {
            res.json({ text: 'captchaFailed' });
            return;
        }
        req.session.reCaptchaToken = req.body.recaptchaResponse;
    }
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
            console.log(req.body.name);
        }
    });
});

module.exports = router;
