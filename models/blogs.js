const mongoose = require("mongoose")

const blogSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },   
}, {timestamps: true})

const Blog = mongoose.model("Blog", blogSchema)

module.exports = Blog;