const fs = require('fs');
const mongoose = require('mongoose');

// Connect to MongoDB Atlas DB using Mongoose
const DBURL = "mongodb+srv://admin:X77xMVUWwSb7R7M@database-lqpxz.azure.mongodb.net/users?retryWrites=true&w=majority";
mongoose.connect(DBURL, {useNewUrlParser: true})
  .then(() => {
    console.log("Successfully connected to database!");
  }, (err) => {
    console.log("Error while connecting to database! Err: " + err);
  });

// Fetch Mongoose models
const ConstQuestions = require('../mongoose-models/constquestion');

const red = fs.readFileSync("./red.txt", {encoding: "UTF-8"});
const redLines = red.split("\n");

for (str of redLines) {
  const questionPattern = /-\t(.+?) =/
  const question = questionPattern.exec(str)[1];
  console.log(question);
}