
var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://jdang217:Awesomej217@ittakestwocluster.ltrhf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

router.post('/api/signup', (req, res, next) => {

	var reqType = req.header('Signup-Part');
	if (reqType == 'username') {
		var form = new multiparty.Form();
		form.parse(req, function(err, fields, files) {
			if (err) throw err;
			MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
				if (err) throw err;
				var dbo = db.db("db");
				dbo.collection("users").findOne({username:fields.username}, function(err, result) {
					if (err) throw err;
					console.log("User duplicate checked");
					if (result != null) {
						return res.status(403).send('Username Duplicate');
					}
					res.json(result);
					db.close();
				})
			});
		})
	}
	else if (reqType == 'password') {

	}
	else {
		var form = new multiparty.Form();
		form.parse(req, function(err, fields, files) {
			if (err) throw err;
			console.log(fields.username + " " + fields.password);
			MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
				if (err) throw err;
				var dbo = db.db("db");
				var newUser = { username: fields.username, password: fields.password };
				dbo.collection("users").insertOne(newUser, function(err, result) {
					if (err) throw err;
					console.log("New User Inserted");
					res.json(result);
					db.close();
				});
			});
		})
	}
});

module.exports = router;