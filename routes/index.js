// Router for handling HTTP requests

const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

// Fetch Mongoose models
const UserData = require('../mongoose-models/user');

// Block if / if not logged in middlewares
const blockLogin = (req, res, next) => {
  if (req.session.userId) {
    res.status(400).send("Already logged in");
  } else {
    next();
  }
}

const blockLogout = (req, res, next) => {
  if (!req.session.userId) {
    res.status(400).send("Not logged in");
  } else {
    next();
  }
}

// Handling login requests
router.post("/login", blockLogin, (req, res) => {
  const { name, pass } = req.body;

  // Look for the user in the database, and then match the password against the salted password
  if (name && pass) {
    UserData.findOne({ name: name }, async (err, user) => {
      if (err) {
        // If unable to read from database, send back error
        res.status(400).send("Error");
        throw err;
      }
      
      // If user found, match password
      if (user && user._id) {
        try {
          if (await bcrypt.compare(pass, user.pass)) {
            // Password is correct
            req.session.userId = user._id;
            res.status(200).send(`Logged in as ${user.name}`);
          } else {
            res.status(400).send("Incorrect password");
          }
        } catch {
          res.status(400).send("Error");
        }
      } else {
        res.status(400).send("User doesn't exist");
      }
    });
  } else {
    res.status(400).send("Missing credentials");
  }
});

// Handling registration requests
router.post("/register", blockLogin, (req, res) => {
  const { name, pass } = req.body;

  // Check if both credentials are inputted
  if (!name || !pass) {return res.status(400).send("Missing credentials");}

  // Check that user doesn't exist already
  UserData.findOne({ name: name }, async (err, user) => {
    if (err) {
      // If unable to read from database, send back error
      res.status(400).send("Error");
      throw err;
    }
    
    if (user && user._id) {
      req.session.userId = user._id;
      res.status(400).send(`User ${user.name} already exists`);
    } else {
      // If user does not exist, make a new user with hashed password
      const hashedPass = await bcrypt.hash(pass, 10) // 10 rounds
      const newUser = new UserData({
        name: name,
        pass: hashedPass,
      })

      // Save new user
      newUser.save()
        .then(user => {
          res.status(200).send(`Created user ${user.name}`);
        })
        .catch(err => {
          console.log("Error while saving new user: " + err);
          res.status(400).send("Error");
        });
    }
  });
});

// Handle logout requests by clearing cookie and session
router.post("/logout", blockLogout, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(400).send("Error");
    }

    res.clearCookie("sessid");
    res.status(200).send("Logged out");
  });
});

module.exports = router;
