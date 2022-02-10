var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');

const auth = require('../../middleware/auth.js');


router.get('/api/profile/:user', auth, (req, res, next) => {
    console.log("got to profile");
    console.log(req.params.user);
    res.status(200).send("OK");
});

module.exports = router;