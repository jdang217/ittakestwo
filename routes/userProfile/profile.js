var express = require('express');
var router = express.Router();
const User = require("../../models/user.js");


const auth = require('../../middleware/auth.js');


router.get('/api/profile/:user', auth, (req, res, next) => {
    User.findOne({username: req.params.user}, {username:1, email:1, createdAt:1, lastSeen:1, friends:1, friendRequests:1, status:1, guild:1, selectedTag:1, tags:1, achievements:1, stats:1, _id:0}, function (err, docs) {
        if (err) {
            throw err;
        }
        else if (docs) {
            //document found
            res.status(200).send(docs);
        }
        else {
            //no document found
            return res.status(400).send('Invalid username');
        }
    })
});

//add friend
router.post('/api/profile/:user/:friend', auth, (req, res, next) => {
    const user = req.user.username

    //unauthorized user
    if (user != req.params.user) {
        return res.status(403)
    }
    User.findOne({username: req.params.friend}, {friends:1, friendRequests:1, _id:0}, function (err, docs) {
        if (err) {
            throw err;
        }
        else if (docs) {
            //document found
            if (!docs.friends.includes(req.params.user) && req.body.type == "ACCEPT") {
                User.findOneAndUpdate({username: req.params.friend}, { "$push": { "friends": req.params.user }, "$pull": { "friendRequests": req.params.user}}, {new: true}, function(err, doc){
                    if (err) {
                        console.log("Something wrong when adding friend!");
                        return res.status(400)
                    }
                    else if (doc) {
                        //document found
                        return res.status(200);
                    }
                })
                User.findOneAndUpdate({username: req.params.user}, { "$push": { "friends": req.params.friend }, "$pull": { "friendRequests": req.params.friend} }, {new: true}, function(err, doc){
                    if (err) {
                        console.log("Something wrong when adding friend!");
                        return res.status(400)
                    }
                    else if (doc) {
                        //document found
                        return res.status(200);
                    }
                })
            }
            else if (req.body.type == "REJECT") {
                User.findOneAndUpdate({username: req.params.user}, { "$pull": { "friendRequests": req.params.friend } }, {new: true}, function(err, doc){
                    if (err) {
                        console.log("Something wrong when adding friend!");
                        return res.status(400)
                    }
                    else if (doc) {
                        //document found
                        return res.status(200);
                    }
                })
            }
            else {
                console.log("Something wrong when adding friend!");
                return res.status(400)
            }
        }
        else {
            //no document found
            return res.status(400).send('Invalid username');
        }
    })
});

//add friend request
router.post('/api/profile/:user/:friend/request', auth, (req, res, next) => {
    const user = req.user.username

    //unauthorized user
    if (user != req.params.user) {
        return res.status(403)
    }
    User.findOne({username: req.params.friend}, {friends:1, friendRequests:1, _id:0}, function (err, docs) {
        if (err) {
            throw err;
        }
        else if (docs) {
            //document found
            if (!docs.friends.includes(req.params.user) && !docs.friendRequests.includes(req.params.user)) {
                User.findOneAndUpdate({username: req.params.friend}, { "$push": { "friendRequests": req.params.user } }, {new: true}, function(err, doc){
                    if (err) {
                        console.log("Something wrong when adding friend request!");
                        return res.status(400)
                    }
                    else if (doc) {
                        //document found
                        return res.status(200);
                    }
                })
            }
        }
        else {
            //no document found
            return res.status(400).send('Invalid username');
        }
    })
});

//update profile
router.post('/api/profile/:user', auth, (req, res, next) => {
    const user = req.user.username

    //unauthorized user
    if (user != req.params.user) {
        return res.status(403)
    }

    if (req.body.username != undefined) {
        //check for duplicate user
        User.findOne({username: req.body.username}, function (err, docs) {
            if (err) {
                console.log(err);
            }
            else if (docs) {
                //document found
                return res.status(403).send('Username Duplicate');
            }
            else {
                User.findOneAndUpdate({username: req.params.user}, req.body, {new: true}, function(err, doc){
                    if (err) {
                        console.log("Something wrong when updating profile");
                        return res.status(400).send("Something wrong when updating profile")
                    }
                    else if (doc) {
                        //document found
                        return res.status(200).send("OK");
                    }
                })
            }
        })
    }
    else {
        User.findOneAndUpdate({username: req.params.user}, req.body, {new: true}, function(err, doc){
            if (err) {
                console.log("Something wrong when updating profile");
                return res.status(400).send("Something wrong when updating profile")
            }
            else if (doc) {
                //document found
                console.log("here5")
                return res.status(200).send("OK");
            }
        })
    }
 
});

//unfriend 
router.post('/api/profile/:user/:friend/unfriend', auth, (req, res, next) => {
    const user = req.user.username

    //unauthorized user
    if (user != req.params.user) {
        return res.status(403)
    }

    User.findOne({username: req.params.friend}, function (err, docs) {
        if (err) {
            console.log(err);
        }
        else if (docs) {
            User.findOneAndUpdate({username: req.params.friend}, { "$pull": { "friends": req.params.user}}, {new: true}, function(err, doc){
                if (err) {
                    console.log("Something wrong when removing friend!");
                    return res.status(400).send("Something wrong when removing friend!")
                }
                else if (doc) {
                    //document found
                    return res.status(200);
                }
            })
            User.findOneAndUpdate({username: req.params.user}, { "$pull": { "friends": req.params.friend} }, {new: true}, function(err, doc){
                if (err) {
                    console.log("Something wrong when removing friend!");
                    return res.status(400).send("Something wrong when removing friend!")
                }
                else if (doc) {
                    //document found
                    return res.status(200);
                }
            })
        }
    })
});


module.exports = router;