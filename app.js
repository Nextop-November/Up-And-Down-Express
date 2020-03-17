var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { createConnection } = require('typeorm');
var indexRouter = require('./routes/index');
var legendRouter = require('./routes/legend');
var laptopRouter = require('./routes/laptop');
var app = express();

(async() => {await createConnection();})();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/legends', legendRouter);
app.use('/laptops', laptopRouter);
app.use('/', indexRouter);

module.exports = app;