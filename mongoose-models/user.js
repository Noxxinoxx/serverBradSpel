// Model for users (apps)

const mongoose = require('mongoose');

// Set up schemas for Mongoose
const Schema = mongoose.Schema;

const userDataSchema = new Schema({
  name: {type: String, required: true},
  pass: {type: String, required: false},
}, {collection: "users"}); // Data object for the users collection

module.exports = mongoose.model("user", userDataSchema);