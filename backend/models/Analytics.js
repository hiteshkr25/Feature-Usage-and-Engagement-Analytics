const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  appId: String,
  event: String,
  feature: String,
  user_id: String,
  details: Object,
  timeSpent: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Analytics", analyticsSchema);