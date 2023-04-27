const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/:shared_id', (req, res) => {
    const crientDirectry = req.app.locals.crientDirectry;
    res.sendFile(path.join(__dirname, '..', crientDirectry, 'readOnly.html'));
});

module.exports = router;
