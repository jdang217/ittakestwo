const mongoose = require("mongoose")

const bugReportSchema = mongoose.Schema({
    sentBy: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        required: true,
    }, 
    details: {
        type: String,
        required: true,
    },   
}, {timestamps: true})

const BugReport = mongoose.model("BugReport", bugReportSchema)

module.exports = BugReport;