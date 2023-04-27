const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
    const crientDirectry = req.app.locals.crientDirectry;
    if (req.session.username !== undefined) {
        console.log(req.session.username + ' is home');
        res.sendFile(path.join(__dirname, '..', crientDirectry, 'home.html'));
    } else {
        res.redirect('/');
    }
});

module.exports = router;
