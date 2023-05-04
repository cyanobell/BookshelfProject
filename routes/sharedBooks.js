'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/:shared_id', async (req, res) => {
    const connection = req.app.locals.connection;
    const crientDirectry = req.app.locals.crientDirectry;
    try {
        const users = await connection.queryAsync('SELECT * FROM users WHERE id = ?', [req.params.shared_id]);
        if (users.length !== 1) {
            res.redirect('/');
            return;
        }
        res.sendFile(path.join(__dirname, '..', crientDirectry, 'readOnly.html'));
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;
