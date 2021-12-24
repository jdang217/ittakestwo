
var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://jdang217:Awesomej217@ittakestwocluster.ltrhf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";


router.get('/', (req, res, next) => {
	MongoClient.connect(url, { useUnifiedTopology: true } ,function(err, db) {
		if (err) throw err;
		var dbo = db.db("db");
		dbo.collection("collection1").find({}).toArray(function(err, result) {
			if (err) throw err;
			console.log('Mongo data coming in hot')
    		console.log(result);
    		res.json(result)
    		db.close();
    	});
	}); 
});

module.exports = router;