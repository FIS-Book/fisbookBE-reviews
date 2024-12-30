var BookReview = require('../../models/book_review');
var ReadingListReview = require('../../models/reading_list_review');
const mongoose = require('mongoose');
const dbConnection = require('../../db');
const request = require('supertest');

jest.setTimeout(30000);
describe('DB connection', () => {
    describe('Check the connection to the database', () => {
        beforeAll(async () => {
            if (dbConnection.readyState === 1) {
                console.log('DB already connected');
            } else {
                // Wait for the DB to connect
                await new Promise((resolve, reject) => {
                    dbConnection.once('connected', resolve);
                    dbConnection.once('error', reject);
                });
            }
        });

        it('should confirm DB is connected', () => {
            //Check if the connection is successful
            expect(dbConnection.readyState).toBe(1);
        });

        it('should confirm the connection is to the correct database', () => {
            //Check if the connection is to the correct database
            expect(dbConnection.name).toBe('FISBook-reviews-db-test');
        });
    });

    describe('Check the addition of a review', () => {
        beforeAll(async () => {
            // Clear the database
            await BookReview.deleteMany({});
        });

        it('should add a bookreview to the database', async () => {
            // Create a new review
            const newReview = new BookReview({
                book_id: '1',
                user_id: '1',
                score: 5,
                title: 'Great book',
                comment: 'I loved this book!',
            });

            // Save the review
            await newReview.save();

            // Find the review
            const foundReview = await BookReview.find();

            // Check if the review is found
            expect(foundReview).toBeArrayOfSize(1);
            expect(mongoose.Types.ObjectId.isValid(foundReview[0]._id)).toBe(true); 
            expect(foundReview[0].book_id).toBe('1');
            expect(foundReview[0].user_id).toBe('1');
            expect(foundReview[0].score).toBe(5);
            expect(foundReview[0].title).toBe('Great book');
            expect(foundReview[0].comment).toBe('I loved this book!');
            expect(foundReview[0].createdAt).toBeDate();
            expect(foundReview[0].lastUpdate).toBeDate();
        });
    });

    afterAll(async () => {
        await dbConnection.dropDatabase(); // Eliminazione del database
        await mongoose.disconnect(); // Disconnessione dal database
    });

});

