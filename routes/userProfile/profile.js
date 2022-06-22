var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');

const auth = require('../../middleware/auth.js');
const Profile = require('../../models/profileModel.js');


router.get('/api/profile/:user', (req, res, next) => {
    Profile.findOne({username: req.params.user}, function (err, docs) {
        if (err) {
            throw err;
        }
        else if (docs) {
            //document found
            res.setHeader("acc-age", docs.timeCreated);
            res.status(200).send("OK");
            // Set other profile information here
        }
        else {
            //no document found
            return res.status(403).send('Invalid username');
        }
    })
    console.log("got to profile");
    console.log(req.params.user);
    
});

router.post('/api/profile/:user', auth, (req, res, next) => {
    if (res.statusCode != 200) {
        next();
    }
    
});

module.exports = router;