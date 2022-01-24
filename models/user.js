const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
})

const User = mongoose.model("User", userSchema)

/*exports.findUser = function findUser(user, callback) {
    console.log(user);
    User.findOne({username: user}, (err, userObj) => {
        if (err) {
            console.log("ok");
            callback(err);
        }
        else if (userObj) {
            console.log("ok1");
            callback(null, userObj);
        }
        else {
            console.log("ok2");
            callback(new Error('Undefined error'));
        }
    })
}*/

module.exports = User;