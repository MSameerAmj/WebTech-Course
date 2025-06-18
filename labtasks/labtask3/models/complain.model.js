let mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  orderId: String,
  email: String,
  complain: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);