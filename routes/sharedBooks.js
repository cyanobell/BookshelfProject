'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');
const Logger = require('../utils/Logger');

router.get('/:shared_id', async (req, res) => {
  const crientDirectry = req.app.locals.crientDirectry;
  res.sendFile(path.join(__dirname, '..', crientDirectry, 'readOnly.html'));
});

module.exports = router;
