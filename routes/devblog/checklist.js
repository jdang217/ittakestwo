var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
const Checklist = require('../../models/checklist.js')

const auth = require('../../middleware/auth.js');

router.post('/api/checklist', auth, (req, res, next) => {
    if (res.statusCode == 400 || res.statusCode == 401) {
        next()
    }
    const checklistType = req.headers['checklist-type']

    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        if (err) throw err;
        var newMessage = JSON.stringify(fields.message);
        
        //remove quotes and brackets
        newMessage = newMessage.replace(/['"[\[\]]+/g, '');
        const filter = { type: checklistType };
        const update = { message: newMessage };

        Checklist.findOneAndUpdate(filter, update, {new: true}, function(err, doc){
            if (err) {
                console.log("Something wrong when updating data!");
            }
            return res.status(200).json(doc);
        });
    })
});

router.get('/api/checklist', auth, (req, res, next) => {
    const checklistType = req.headers['checklist-type']

    const filter = { type: checklistType };

    Checklist.findOne(filter, function(err, docs) {
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
    });

});

module.exports = router;
