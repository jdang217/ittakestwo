
var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URL;

router.get('/', (req, res, next) => {
	MongoClient.connect(url, { useUnifiedTopology: true } ,function(err, db) {
		if (err) throw err;
		var dbo = db.db("db");
		dbo.collection("collection1").find({}).toArray(function(err, result) {
			if (err) throw err;
    		console.log(result);
    		res.json(result);
    		db.close();
    	});
	}); 
});

module.exports = router;