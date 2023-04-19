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
    lastSeen: {
        type: Date,
        required: false,
    },
    friends: {
        type: Array,
        required: false,
    },
    friendRequests: {
        type: Array,
        required: false,
    },
    status: {
        type: String,
        required: false,
    },
    guild: {
        type: String,
        required: false,
    },
    selectedTag: {
        type: String,
        required: false,
    },
    tags: {
        type: Array,
        required: false,
    },
    achievements: {
        type: Array,
        required: false,
    },
    stats: {
        type: Array,
        required: false,
    },
    email: {
        type: String,
        required: false,
    }

}, {timestamps: true})

const User = mongoose.model("User", userSchema)

module.exports = User;