const mongoose = require("mongoose");

const SeedStateSchema = new mongoose.Schema(
  {
    appId: { type: String, required: true, index: true, unique: true },
    seededAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

module.exports = mongoose.model("SeedState", SeedStateSchema);

