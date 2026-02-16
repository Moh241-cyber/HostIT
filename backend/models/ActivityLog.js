const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    activity: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
