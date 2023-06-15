var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require("mongoose");
require('dotenv').config();

var indexRouter = require('./routes/index');
var authorRouter = require('./routes/author');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: '*'
}));

app.use('/', indexRouter);
app.use('/author', authorRouter);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var port = 3030;
app.listen(process.env.PORT || port, () => console.log('Abouht Server is Listening : ' + port));

// DB connection
const dbAddress = "mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@" + process.env.DB_HOST;

mongoose.connect(dbAddress, {
    // useNewUrlPaser: true,
    // useUnifiedTofology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
}).then(() => console.log("MongoDB Connected")).catch((err) => console.log(err));

module.exports = app;
