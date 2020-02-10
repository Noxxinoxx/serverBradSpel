// NodeJS sever for handling of login and saving/modifying/loading cards

const createError = require('http-errors');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const session = require('express-session');

const indexRouter = require('./routes/index');
const questionRouter = require('./routes/questions');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(session({
  name: "sessid",
  secret: "@?MTzaV?$D|qgG*Zqo41bgxaieg%+9Jx|fm0=OAaC8$Vq13hOpbf1Cv#=SBVHfrD+-yo3%UL?0#O!psa8Z_u#rB61@vF$Y3h%*Y0b?g8Z!*yXMvxAADxODz&Bpj5A&E3",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: (48000 * 3600),
    sameSite: true
  },
}));

// Connect to MongoDB Atlas DB using Mongoose
const DBURL = "mongodb+srv://admin:X77xMVUWwSb7R7M@database-lqpxz.azure.mongodb.net/users?retryWrites=true&w=majority";
mongoose.connect(DBURL, {useNewUrlParser: true})
  .then(() => {
    console.log("Successfully connected to database!");
  }, (err) => {
    console.log("Error while connecting to database! Err: " + err);
  });

// Fetch Mongoose models
const UserData = require('./mongoose-models/user');

// Save user in req.locals if it exists so no duplicate checks are needed
app.use((req, res, next) => {
  const { userId } = req.session;
  if (userId) {
    // Read from organisations and find user
    UserData.findOne({_id: userId}, (err, user) => {
      if (err) return console.log(err);
      req.user = {id: userId, name: user.name};
      next();
    });
  } else {
    next();
  }
})

// Route to certain sections
app.use('/', indexRouter);
app.use('/questions', questionRouter);

// Catch 404 and send to error handler below
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Send error
  res.status(err.status || 500);
  res.send("Internal server error:" + err.message);
});

// Start server on port 8080
const PORT = 3001;
app.listen(PORT, () => {console.log(`Listening to port ${PORT}!`)})

module.exports = app;