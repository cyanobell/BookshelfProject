'use strict';
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  console.log(req.session.username + ' is logout');
  req.session.regenerate((err) => {
    req.session.user_id = undefined;
    req.session.username = undefined;
    res.redirect('/');
  });
});

module.exports = router;
