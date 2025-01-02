var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger-output.json')

var indexRouter = require('./routes/index');
var reviewsRouter = require('./routes/reviews');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/reviews/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

module.exports = app;
