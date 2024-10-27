const mongoose = require("mongoose")
const MemberSchema = new mongoose.Schema({
    playerId: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    transactionId: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model("MembersData", MemberSchema)