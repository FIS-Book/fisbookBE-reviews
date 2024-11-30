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
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

// Connect to MongoDB
const mongoose = require('mongoose');
// Load environment variables from .env file
require('dotenv').config();
//Function to connect to the database

async function connectToDatabase() {
    try {

        const DB_URL = process.env.DB_URL || 'mongodb://localhost/test'; // Usa la variabile di ambiente DB_URL
        console.log('DB_URL:', process.env.DB_URL)
        await mongoose.connect(DB_URL);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
}

connectToDatabase();

module.exports = app;
