// Model for constant questions that don't belong to a user

const mongoose = require('mongoose');
const random = require('mongoose-simple-random');

// Set up schemas for Mongoose
const Schema = mongoose.Schema;

const constQuestionDataSchema = new Schema({
  title: {type: String, required: true},
  a1: {type: Object, required: true}, // Answer: { a: "Answer", c: false } c = correct
  a2: {type: Object, required: true},
  a3: {type: Object, required: true},
  a4: {type: Object, required: true},
  categ: {type: String, required: true}, // Category
  diff: {type: Object, required: true}, // { e: false, m: false, h: false }
}, {collection: "constquestions"}).plugin(random); // Use random plugin to allow certain function

module.exports = mongoose.model("constquestion", constQuestionDataSchema);