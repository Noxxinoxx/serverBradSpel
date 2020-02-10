// Router for handling HTTP requests

const express = require('express');
const bcrypt = require('bcrypt');

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
    UserData.findOne({ title: title }, (err, question) => {
      if (err) {
        // If unable to read from database, send back error
        res.status(400).send("Error");
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
              res.status(400).send("Error: " + error);
            })
        } catch(error) {
          res.status(400).send("Error: " + error);
        }
        
      }
    });
  } else {
    res.status(400).send("Missing data");
  }
});

// Handle logout requests by clearing cookie and session
router.post("/logout", requireLogin, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(400).send("Error");
    }

    res.clearCookie("sessid");
    res.status(200).send("Logged out");
  });
});

module.exports = router;
