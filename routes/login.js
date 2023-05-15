'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const CONFIG = require('../bookshelf_app/SC_CONFIG');

const fs = require('fs');
const secretKey = fs.readFileSync('.secretkeys/google_reCAPTCHA', 'utf-8').trim();
const reCaptchaSubmit = require('./reCaptchaSubmit.js');

router.get('/', (req, res) => {
  const crientDirectry = req.app.locals.crientDirectry;
  res.sendFile(path.join(__dirname, '..', crientDirectry, 'login.html'));
});

router.post('/', async (req, res) => {
  const connection = req.app.locals.connection;
  const { name, pass } = req.body;

  if (!name || !pass) {
    res.status(401).send('The name or pass is empty');
    return;
  }

  if ((name.length < CONFIG.user.name_length.min || name.length > CONFIG.user.name_length.max)
    || (pass.length < CONFIG.user.pass_length.min || pass.length > CONFIG.user.pass_length.max))  {
    console.log('input is wrong format');
    res.status(401).send('input is wrong format');
    return;
  }

  if (await reCaptchaSubmit(secretKey, req.body.recaptchaToken) === false) {
    res.status(401).send('reCaptchaFailed');
    return;
  }

  try {
    const users = await connection.queryAsync('SELECT * FROM users WHERE name = ? LIMIT 1', [name]);
    if (users.length === 0 || !bcrypt.compare(pass, users[0].pass)) {
      console.log(`${name} is login failed`);
      res.status(401).send('user or password is wrong');
      return;
    }

    const user = users[0];
    console.log(`${name} is login`);
    req.session.regenerate((err) => {
      if (err) {
        console.error(err);
      }
      req.session.user_id = user.id;
      req.session.username = user.name;
      res.status(200).send();
    });

  } catch (error) {
    console.error("asdf");
    res.status(500).send('server error');
    console.error(error);
  }
});

module.exports = router;
