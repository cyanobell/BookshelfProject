'use strict';
const express = require('express');
const router = express.Router();

router.get('/', (req, res ,next) => {
  if(req.oidc && req.oidc.isAuthenticated())
  {
    res.redirect('/auth_callback');
    return;
  }
  next();
});

module.exports = router;
