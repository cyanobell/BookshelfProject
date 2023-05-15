'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');

const {requiresAuth} = require('express-openid-connect');

router.get('/', requiresAuth(), async (req, res) => {
  const crientDirectry = req.app.locals.crientDirectry;
  res.sendFile(path.join(__dirname, '..', crientDirectry, 'home.html'));
});

module.exports = router;
