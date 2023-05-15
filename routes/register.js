'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const CONFIG = require('../bookshelf_app/SC_CONFIG');

const fs = require('fs');
const secretKey = fs.readFileSync('.secretkeys/google_reCAPTCHA', 'utf-8').trim();
const reCaptchaSubmit = require('./reCaptchaSubmit.js');
const { async } = require('regenerator-runtime');

//show register
router.get('/', (req, res) => {
  const crientDirectry = req.app.locals.crientDirectry;
  res.sendFile(path.join(__dirname, '..', crientDirectry, 'register.html'));
});

async function checkExistUserShareingSeed(req, shareing_seed) {
  const connection = req.app.locals.connection;
  const result = connection.queryAsync("SELECT * FROM users WHERE shareing_seed = ? LIMIT 1", [shareing_seed]);
  return result.length > 0;
}

async function generateSeed(req) {
  const { name, pass } = req.body;
  const saltRounds = req.app.locals.saltRounds;
  let shareing_seed;
  //ランダムな値を生成
  const BCRYPT_HEADDER = 7;
  do {
    const now = new Date();
    const time_solt = now.getTime().toString();
    const shareing_hash = await bcrypt.hash(pass + name + time_solt, saltRounds);
    shareing_seed = shareing_hash.replace(/\//g, '-').slice(BCRYPT_HEADDER);
  } while (await checkExistUserShareingSeed(req, shareing_seed) === true);
  return shareing_seed;
}

//posted register input 
router.post('/', async (req, res) => {
  const connection = req.app.locals.connection;
  const saltRounds = req.app.locals.saltRounds;
  const { name, pass } = req.body;

  if (!name || !pass) {
    console.log('name ro pass empty');
    res.status(401).send('The name or pass is empty');
    return;
  }

  if ((name.length < CONFIG.user.name_length.min || name.length > CONFIG.user.name_length.max)
    || (pass.length < CONFIG.user.pass_length.min || pass.length > CONFIG.user.pass_length.max)) {
    console.log('input is wrong format');
    res.status(401).send('input is wrong format');
    return;
  }

  if (await reCaptchaSubmit(secretKey, req.body.recaptchaToken) === false) {
    console.log('reCAPTCHA failed');
    res.status(401).send('reCaptchaFailed');
    return;
  }

  try {
    const users = await connection.queryAsync('SELECT * FROM users WHERE name = ?', [name]);
    if (users.length !== 0) {
      console.log(`The ${name} is already registered`);
      res.status(409).send('The name is already registered');
      return;
    }
    const hashedPassword = await bcrypt.hash(pass, saltRounds);
    //ランダムな値を生成
    const shareing_seed = await generateSeed(req);
    await connection.queryAsync("INSERT INTO users(name, pass, shareing_seed) VALUES (?, ?, ?)", [name, hashedPassword, shareing_seed]);

    const registered = await connection.queryAsync("SELECT last_insert_id()");
    const user_id = registered[0]['last_insert_id()'];
    req.session.regenerate((err) => {
      req.session.user_id = user_id;
      req.session.username = name;
      res.status(201).send();
    });
    console.log(name + ' is register');
  } catch (error) {
    res.status(500).send('server error');
    console.error(error);
  }
});

module.exports = router;
