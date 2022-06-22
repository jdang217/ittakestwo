
var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
const jwt = require("jsonwebtoken")
const User = require("../../models/user.js");
const Profile = require('../../models/profileModel.js');

router.post('/api/signup', (req, res, next) => {

	var reqType = req.header('Signup-Part');
	if (reqType == 'username') {
		var form = new multiparty.Form();
		form.parse(req, function(err, fields, files) {
			if (err) throw err;
			var user = JSON.stringify(fields.username);
			//remove quotes and brackets
			user = user.replace(/['"[\[\]]+/g, '');
			
			User.findOne({username: user}, function (err, docs) {
				if (err) {
					console.log(err);
				}
				else if (docs) {
					//document found
					return res.status(403).send('Username Duplicate');
				}
				else {
					//no document found
					return res.status(200).send('Success');
				}
			})
		})
	}
	else {
		var form = new multiparty.Form();
		form.parse(req, function(err, fields, files) {
			if (err) throw err;
			var user = fields.username.toString();
			var pass = fields.password.toString();
			
			User.findOne({username: user}, function (err, docs) {
				if (err) {
					console.log(err);
				}
				else if (docs) {
					//document found
					return res.status(403).send('Username Duplicate');
				}
				else {
					//no document found
					let time = Date.now();
					const newUser = new User({
						username: user,
						password: pass,
					})
					const newProfile = new Profile({
						username:user,
						timeCreated: time,
					})
					
					newUser.save();
					newProfile.save();
					return res.status(200).send('Success');
				}
			})
		})
	}
});

module.exports = router;