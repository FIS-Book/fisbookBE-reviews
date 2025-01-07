var BookReview = require('../../models/book_review');
var ReadingListReview = require('../../models/reading_list_review');
const mongoose = require('mongoose');
const dbConnection = require('../../db');

jest.setTimeout(30000);

describe('Integration-Test Reviews DB connection', () => {

    describe('Check the connection to the review database', () => {
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

    describe('Check the CRUD operations', () => {
        beforeEach(async () => {
            // Clear the database
            await BookReview.deleteMany({});
            await ReadingListReview.deleteMany({});
        });
        afterAll(async () => {
            //await dbConnection.dropDatabase(); // Eliminate the database
            await mongoose.disconnect(); // Disconnect from the database
        });
        describe('Check the addition of a book review', () => {
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
    
        describe("Check the addition of a reading list review", () => {
            beforeAll(async () => {
                // Clear the database
                await ReadingListReview.deleteMany({});
            });
    
            it('should add a reading list review to the database', async () => {
                // Create a new review
                const newReview = new ReadingListReview({
                    reading_list_id: '1',
                    user_id: '1',
                    score: 5,
                    title: 'Great reading list',
                    comment: 'I loved this reading list!',
                });
    
                // Save the review
                await newReview.save();
    
                // Find the review
                const foundReview = await ReadingListReview.find();
    
                // Check if the review is found
                expect(foundReview).toBeArrayOfSize(1);
                expect(mongoose.Types.ObjectId.isValid(foundReview[0]._id)).toBe(true); 
                expect(foundReview[0].reading_list_id).toBe('1');
                expect(foundReview[0].user_id).toBe('1');
                expect(foundReview[0].score).toBe(5);
                expect(foundReview[0].comment).toBe('I loved this reading list!');
                expect(foundReview[0].createdAt).toBeDate();
                expect(foundReview[0].lastUpdate).toBeDate();
            });
        });
    
        describe("Check the deletion of a book review", () => {
            beforeAll(async () => {
                // Clear the database
                await BookReview.deleteMany({});
            });
    
            it('should delete a book review from the database', async () => {
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
    
                // Delete the review
                await BookReview.findByIdAndDelete(foundReview[0]._id );
    
                // Find the review
                const foundReviewAfterDelete = await BookReview.find();
    
                // Check if the review is deleted
                expect(foundReviewAfterDelete).toBeArrayOfSize(0);
            });
        });
    
        describe("Check the deletion of a reading list review", () => {
            beforeAll(async () => {
                // Clear the database
                await ReadingListReview.deleteMany({});
            });
            it('should delete a reading list review from the database', async () => {
                // Create a new review
                const newReview = new ReadingListReview({
                    reading_list_id: '1',
                    user_id: '1',
                    score: 5,
                    title: 'Great reading list',
                    comment: 'I loved this reading list!',
                });
    
                // Save the review
                await newReview.save();
    
                // Find the review
                const foundReview = await ReadingListReview.find();
    
                // Check if the review is found
                expect(foundReview).toBeArrayOfSize(1);
    
                // Delete the review
                await ReadingListReview.findByIdAndDelete(foundReview[0]._id );
    
                // Find the review
                const foundReviewAfterDelete = await ReadingListReview.find();
    
                // Check if the review is deleted
                expect(foundReviewAfterDelete).toBeArrayOfSize(0);
            });
        });
    
        describe("Check the update of a book review", () => {
            beforeAll(async () => {
                // Clear the database
                await BookReview.deleteMany({});
            });
    
            it('should update a book review in the database', async () => {
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
                newDate = Date.now();
                // Update the review
                await BookReview.findByIdAndUpdate(foundReview[0]._id , { score: 4 ,title: 'Good book',comment: 'I liked this book',lastUpdate: newDate});
    
                // Find the review
                const foundReviewAfterUpdate = await BookReview.find();
    
                // Check if the review is updated
                expect(foundReviewAfterUpdate).toBeArrayOfSize(1);
                expect(foundReviewAfterUpdate[0].book_id).toBe('1');
                expect(foundReviewAfterUpdate[0].user_id).toBe('1');
                expect(foundReviewAfterUpdate[0].score).toBe(4);
                expect(foundReviewAfterUpdate[0].title).toBe('Good book');
                expect(foundReviewAfterUpdate[0].comment).toBe('I liked this book');
                expect(foundReviewAfterUpdate[0].lastUpdate.getTime()).toBe(newDate);
            });
        });
    
        describe("Check the update of a reading list review", () => {
            beforeAll(async () => {
                // Clear the database
                await ReadingListReview.deleteMany({});
            });
    
            it('should update a reading list review in the database', async () => {
                // Create a new review
                const newReview = new ReadingListReview({
                    reading_list_id: '1',
                    user_id: '1',
                    score: 5,
                    comment: 'I loved this reading list!',
                });
    
                // Save the review
                await newReview.save();
    
                // Find the review
                const foundReview = await ReadingListReview.find();
    
                // Check if the review is found
                expect(foundReview).toBeArrayOfSize(1);
                newDate = Date.now();
                // Update the review
                await ReadingListReview.findByIdAndUpdate(foundReview[0]._id ,  {score: 4 ,comment: 'I liked this reading list',lastUpdate: newDate});
    
                // Find the review
                const foundReviewAfterUpdate = await ReadingListReview.find();
    
                // Check if the review is updated
                expect(foundReviewAfterUpdate).toBeArrayOfSize(1);
                expect(foundReviewAfterUpdate[0].reading_list_id).toBe('1');
                expect(foundReviewAfterUpdate[0].user_id).toBe('1');
                expect(foundReviewAfterUpdate[0].score).toBe(4);
                expect(foundReviewAfterUpdate[0].comment).toBe('I liked this reading list');
                expect(foundReviewAfterUpdate[0].lastUpdate.getTime()).toBe(newDate);
            });
        });
    });
});

