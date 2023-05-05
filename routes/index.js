'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
  const crientDirectry = req.app.locals.crientDirectry;
  res.sendFile(path.join(__dirname, '..', crientDirectry, 'index.html'));
});

module.exports = router;
