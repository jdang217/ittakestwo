
var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
const jwt = require("jsonwebtoken")
const User = require("../../models/user.js");
const bcrypt = require("bcryptjs");

const oneDay = 86400;

const auth = require('../../middleware/auth.js');
const Profile = require('../../models/profileModel.js');

router.post('/api/signin', (req, res, next) => {

	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files) {
		if (err) throw err;
		var user = fields.username.toString();
		var pass = fields.password.toString();
		
		User.findOne({username: user}, function (err, docs) {
			if (err) {
				throw err;
			}
			else if (docs) {
				//document found
				bcrypt.compare(pass, docs.password)
				.then(isCorrect => {
					if (isCorrect) {
						//correct password
						const payload = {
							id: docs._id,
							username: docs.username,
						}
						jwt.sign(
							payload,
							process.env.JWT_SECRET,
							{expiresIn: oneDay},
							(err, token) => {
								if (err) throw err;
								return res.status(200).send({
									message: "Success", 
									token: "Bearer " + token,
								})
							}
						)					}
					else {
						//invalid password
						return res.status(403).send('Invalid username or password');
					}
				})
				.catch(err => console.log(err))
			}
			else {
				//no document found
				return res.status(403).send('Invalid username or password');
			}
		})
	})
});

router.get('/api/signin', auth, (req, res, next) => {
	if (res.statusCode == 400 || res.statusCode == 401) {
		next()
	}
	else {
		
		User.findById(req.user.id)
			.select('-password')
			.then(user => res.json(user));
	}
});

module.exports = router;