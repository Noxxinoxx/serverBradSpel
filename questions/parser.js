const fs = require('fs');
const { performance } = require('perf_hooks');
const mongoose = require('mongoose');

// Connect to MongoDB Atlas DB using Mongoose
const DBURL = "mongodb+srv://admin:X77xMVUWwSb7R7M@database-lqpxz.azure.mongodb.net/users?retryWrites=true&w=majority";
mongoose.connect(DBURL, {useNewUrlParser: true})
  .then(() => {
    console.log("\x1b[32m%s\x1b[0m", "Successfully connected to database");
    main();
  }, (err) => {
    console.log("\x1b[31m%s\x1b[0m", "Error while connecting to database! Err: " + err);
  });

// Fetch Mongoose models
const ConstQuestion = require('../mongoose-models/constquestion');

async function parseLine(str, diff, increaseCount) {
  const questionPattern = /(\w.+?) =/;
  const question = questionPattern.exec(str)[1];
  const corrAnswerPattern = /\((.+?)\)/;
  const corrAnswer = corrAnswerPattern.exec(str)[1];
  const incoAnswerPattern = /\. [\wåäö°, \-\+]+|\) [\wåäö°, \-\+]+/gi;
  const incoAnswers = str.match(incoAnswerPattern);
  const incoAns1 = incoAnswers[0].substring(2);
  const incoAns2 = incoAnswers[1].substring(2);
  const incoAns3 = incoAnswers[2].substring(2);
  // console.log(`Fråga: ${question}, Svar: ${corrAnswer}, Fel svar 1: ${incoAns1}, Fel svar 2: ${incoAns2}, Fel svar 3: ${incoAns3}`);

  const newQuestion = new ConstQuestion({
    title: question,
    a1: { a: corrAnswer, c: true },
    a2: { a: incoAns1, c: false },
    a3: { a: incoAns2, c: false },
    a4: { a: incoAns3, c: false },
    categ: "Övrigt",
    diff: { e: diff==="e", m: diff==="m", h: diff==="h" },
  });
  await newQuestion.save(err => {
    if (err)
      console.log(err);
  });
  return increaseCount();
}

async function main() {
  console.log("\x1b[36m%s\x1b[0m", "Running parser...");
  const inTime = performance.now();
  // Read files and split into lines
  const red = fs.readFileSync("./red.txt", {encoding: "UTF-8"});
  const redLines = red.split("\n");
  const yellow = fs.readFileSync("./yellow.txt", {encoding: "UTF-8"});
  const yellowLines = yellow.split("\n");
  const green = fs.readFileSync("./green.txt", {encoding: "UTF-8"});
  const greenLines = green.split("\n");

  // Delete all entries in database so that no duplicates will exist
  await ConstQuestion.deleteMany({}, err => {
    console.log("\x1b[33m%s\x1b[0m", err || "Successfully deleted all entries from database");
  })

  let questionCount = 0;

  // Loop over red questions and find all parts using RegExp (urghh)
  for (let str of redLines) {
    await parseLine(str, "h", () => questionCount++);
  }
  for (let str of yellowLines) {
    await parseLine(str, "m", () => questionCount++);
  }
  for (let str of greenLines) {
    await parseLine(str, "e", () => questionCount++);
  }

  console.log("\x1b[32m%s\x1b[0m", `Finished adding all (${questionCount}) entries to database`);

  const endTime = performance.now();
  console.log("\x1b[36m%s\x1b[0m", `Parser finished! (${Math.floor(endTime - inTime + .5)}ms)`);
}