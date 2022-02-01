var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
const Blog = require('../../models/blogs.js')

const auth = require('../../middleware/auth.js');

router.post('/api/devblog', auth, (req, res, next) => {
    if (res.statusCode == 400 || res.statusCode == 401) {
        next()
    }
    const user = req.user.username
    if (user != "jdang217" && user != "test" ) {
        next()
    }
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        if (err) throw err;
        var newMessage = JSON.stringify(fields.message);

        //remove quotes and brackets
        newMessage = newMessage.replace(/['"[\[\]]+/g, '');
        
        const newBlog = new Blog({
            username: user,
            message: newMessage
        })
        
        newBlog.save()
        return res.status(200);
    })
});

router.get('/api/devblog', auth, (req, res, next) => {
    let user;

    if (res.statusCode != 400 && res.statusCode != 401) {
        user = req.user.username;
    }

    if (user === "jdang217" || user === "test") {
        res.setHeader('Can-Post', 'true')
    }
    else {
        res.setHeader('Can-Post', 'false')
    }

    Blog.find(function(err, docs) {
        if (err) {
            console.log(err);
        }
        else if (docs) {
            //document found
            return res.status(200).json(docs);
        }
        else {
            //no document found
            return res.status(404).send('Did not find posts');
        }
    }).sort({ createdAt: -1 }).limit(10);

});

module.exports = router;
