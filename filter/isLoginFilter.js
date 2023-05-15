'use strict';
const express = require('express');
const router = express.Router();

async function isLogin(req) {
  const connection = req.app.locals.connection;
  if(req.session.user_id === undefined)
  {
    console.log('session user_id undefined');
    return false;
  }
  const user_id = req.session.user_id;
  const users = await connection.queryAsync('SELECT * FROM users WHERE id = ? LIMIT 1', [user_id]);
  if(users.length === 0)
  {
    console.log(`${user_id} is unRegister`);
    return false;
  }
  return true;
}

router.get('/', async (req, res, next) => {
  if (await isLogin(req) === false) {
    console.log('not login user trying operate');
    res.status(401).send('user is not logined');
    return;
  }
  next();
});

router.post('/', async (req, res, next) => {
  if (await isLogin(req) === false) {
    console.log('not login user trying operate');
    res.status(401).send('user is not logined');
    return;
  }
  next();
});

module.exports =  router;
