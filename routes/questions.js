// Router for handling requests to save and get questions

const express = require('express');

const router = express.Router();

// Fetch Mongoose models
const QuestionData = require('../mongoose-models/question');

// Block if / if not logged in middlewares
const requireLogout = (req, res, next) => {
  if (req.session.userId) {
    res.status(400).send("Already logged in");
  } else {
    next();
  }
}

const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.status(400).send("Not logged in");
  } else {
    next();
  }
}

// Handling new question requests
router.post("/new", requireLogin, (req, res) => {
  const { title, a1, a2, a3, a4, categ, diff } = req.body;

  // Check so all data exists
  if (title && a1 && a2 && a3 && a4 && categ && diff) {
    // See if question already exists
    QuestionData.findOne({ title: title, author: req.user.userId }, (err, question) => {
      if (err) {
        // If unable to read from database, send back error
        res.status(400).send("Error while reading from database");
      }
      
      // If a question is found, send back error
      if (question && question._id) {
        res.status(400).send("Question already exists");
      } else {
        // Create new question from posted data
        try {
          const question = new QuestionData({
            author: req.user.id,
            title: title,
            a1: a1,
            a2: a2,
            a3: a3,
            a4: a4,
            categ: categ,
            diff: diff,
          });
          
          question.save()
            .then(() => {
              res.status(200).send("Question saved successfully");
            })
            .catch(error => {
              res.status(400).send("Error while saving: " + error);
            })
        } catch(error) {
          res.status(400).send("Error while creating data model, data input types might be incorrect: " + error);
        }
        
      }
    });
  } else {
    res.status(400).send("Missing data");
  }
});

// Handling question deletion requests
router.post("/remove", requireLogin, (req, res) => {
  const { title } = req.body;

  // Check so all data exists
  if (title) {
    // See if question already exists
    QuestionData.deleteOne({ title: title, author: req.user.id }, (err) => {
      if (err) {
        // If unable to read from database, send back error
        res.status(400).send("Error while reading from database");
      } else {
        res.status(200).send("Question deleted successfully");
      }
    });
  } else {
    res.status(400).send("Missing data");
  }
});

router.get("/getUser", requireLogin, (req, res) => {
  QuestionData.find({ author: req.user.id }, (err, questions) => {
    if (err) {
      res.status(400).send("Error while reading from database");
    } else if (questions.length < 1) {
      res.status(400).send("User has written no questions");
    } else {
      // Change question array into array of app-readable questions
      function parseQuestion(q) {
        return {
          title: q.title,
          a1: q.a1,
          a2: q.a2,
          a3: q.a3,
          a4: q.a4,
          categ: q.categ,
          diff: q.diff,
        }
      }

      let parsedQuestions = [];
      for (question of questions) {
        parsedQuestions.push(parseQuestion(question));
      }
      res.status(200).send(JSON.stringify(parsedQuestions));
    }
  })
})

router.post("/getQuestion", requireLogin, (req, res) => {
  const { diff, params } = req.body;

  if (diff && params) {
    let checked = []; // Set up filters to look for
    if (params.checkedAllt || params.checkedMatte) checked.push("Matte");
    if (params.checkedAllt || params.checkedEngelska) checked.push("Engelska");
    if (params.checkedAllt || params.checkedGeografi) checked.push("Geografi");
    if (params.checkedAllt || params.checkedSvenska) checked.push("Svenska");
    if (params.checkedAllt) checked.push("Övrigt");
    // const nonChecker = {$or: [true, false]};

    queryParams = { 
      categ: {$in: checked}, 
      author: req.user.id,
    }
    // Only look for the difficulty entered as true if that diff is selected, otherwise look for true or false
    diff==="easy"? queryParams["diff.e"] = true : queryParams["$or"] = [{"diff.e": true, "diff.e": false}];
    diff==="medium"? queryParams["diff.m"] = true : queryParams["$or"] = [{"diff.m": true, "diff.m": false}];
    diff==="hard"? queryParams["diff.h"] = true : queryParams["$or"] = [{"diff.h": true, "diff.h": false}];
    
    if (diff === "easy" || diff === "medium" || diff === "hard") {
      QuestionData.findRandom(queryParams, {}, {limit: 1}, (err, result) => {
        if (err) {
          res.status(400).send("Error while reading from database " + err);
        } else {
          if (result && result.length > 0) {
            // Make a more client readable JSON and send back
            const saved = result[0];
            const clientReadable = {
              title: saved.title,
              a1: saved.a1,
              a2: saved.a2,
              a3: saved.a3,
              a4: saved.a4,
              categ: saved.categ,
              diff: diff,
            }
            res.status(200).send(JSON.stringify(clientReadable));
          } else {
            res.status(400).send("Found no questions");
          }
        }
      })
    } else {
      res.status(400).send("Invalid difficulty");
    }
  
  } else {
    res.status(400).send("Missing data");
  }
})

module.exports = router;
