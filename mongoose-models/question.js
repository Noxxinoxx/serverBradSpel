// Model for users (apps)

const mongoose = require('mongoose');

// Set up schemas for Mongoose
const Schema = mongoose.Schema;

const questionDataSchema = new Schema({
  author: {type: Schema.Types.ObjectId, required: true},
  title: {type: String, required: true},
  a1: {type: Object, required: true}, // Answer: { a: "Answer", c: false } c = correct
  a2: {type: Object, required: true},
  a3: {type: Object, required: true},
  a4: {type: Object, required: true},
  categ: {type: String, required: true}, // Category
  diff: {type: Object, required: true}, // { e: false, m: false, h: false }
}, {collection: "questions"}); // Data object for the users collection

module.exports = mongoose.model("question", questionDataSchema);