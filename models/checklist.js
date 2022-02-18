const mongoose = require("mongoose")

const checklistSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },   
})

const Checklist = mongoose.model("Checklist", checklistSchema)

module.exports = Checklist;