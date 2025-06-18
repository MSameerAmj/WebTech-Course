const { compare } = require('bcrypt');
let mongoose = require('mongoose');

let adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

adminSchema.methods.comparePassword = function (plainPassword) {
  return plainPassword === this.password;
};

module.exports = mongoose.model('Admin', adminSchema);


