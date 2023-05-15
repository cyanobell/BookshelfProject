'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/*', (req, res) => {
  const crientDirectry = req.app.locals.crientDirectry;
  res.sendFile(path.join(__dirname, '..', crientDirectry, '404.html'));
});

router.get('/error/404', (req, res) => {
  const crientDirectry = req.app.locals.crientDirectry;
  res.sendFile(path.join(__dirname, '..', crientDirectry, '404.html'));
});

router.post('/*', (req, res) => {
  const crientDirectry = req.app.locals.crientDirectry;
  res.sendFile(path.join(__dirname, '..', crientDirectry, '500.html'));
});

router.get('/error/500', (req, res) => {
  const crientDirectry = req.app.locals.crientDirectry;
  res.sendFile(path.join(__dirname, '..', crientDirectry, '500.html'));
});

module.exports =  router;
