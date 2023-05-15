'use strict';
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const { requiresAuth } = require('express-openid-connect');
async function isNewUser(req) {
  const connection = req.app.locals.connection;
  const sub = req.oidc.user.sub;

  const result = await connection.queryAsync("SELECT * FROM users WHERE user_id = ? LIMIT 1", [sub]);
  return result.length === 0;
}

async function checkExistUserShareingSeed(req, shareing_seed) {
  const connection = req.app.locals.connection;
  const result = connection.queryAsync("SELECT * FROM users WHERE shareing_seed = ? LIMIT 1", [shareing_seed]);
  return result.length > 0;
}

async function generateSeed(req) {
  const { name, user_id } = req.oidc.user;
  const saltRounds = req.app.locals.saltRounds;
  let shareing_seed;
  //ランダムな値を生成
  const BCRYPT_HEADDER = 7;
  do {
    const now = new Date();
    const time_solt = now.getTime().toString();
    const shareing_hash = await bcrypt.hash(user_id + name + time_solt, saltRounds);
    shareing_seed = shareing_hash.replace(/\//g, '-').slice(BCRYPT_HEADDER);
  } while (await checkExistUserShareingSeed(req, shareing_seed) === true);
  return shareing_seed;
}

async function registerNewUser(req) {
  const connection = req.app.locals.connection;

  const shareing_seed = await generateSeed(req);
  const { name, sub } = req.oidc.user;
  await connection.queryAsync("INSERT INTO users(name, user_id, shareing_seed) VALUES (?, ?, ?)", [name, sub, shareing_seed]);
}

router.get('/', requiresAuth(), async (req, res) => {
  if (await isNewUser(req) === true) {
    console.log(`${req.oidc.user.sub} | ${req.oidc.user.name} is register`);
    registerNewUser(req);
  }
  console.log(`${req.oidc.user.name} is login`);
  res.redirect('/home');
});

module.exports = router;
