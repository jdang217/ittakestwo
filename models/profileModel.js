const mongoose = require("mongoose")

const profileSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    timeCreated: {
        type: Number,
        required: true,
    },
    // profileImg: {
    //     data: Buffer,
    //     contentType: String
    // }
})

const Profile = mongoose.model("Profile", profileSchema)

module.exports = Profile;