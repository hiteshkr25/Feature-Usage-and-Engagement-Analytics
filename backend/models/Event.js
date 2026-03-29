const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    appId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    eventType: { type: String, required: true, index: true },

    featureName: { type: String, default: null },
    pageName: { type: String, default: null },

    // Stored as milliseconds (number). Frontend can convert to seconds.
    timeSpent: { type: Number, default: null },

    timestamp: { type: Date, default: () => new Date(), index: true },

    metadata: { type: mongoose.Schema.Types.Mixed, default: undefined },
  },
  { timestamps: false }
);

EventSchema.index({ appId: 1, timestamp: -1 });

module.exports = mongoose.model("Event", EventSchema);

