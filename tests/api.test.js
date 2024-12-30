const app= require('../app');
const request = require('supertest');
const BookReview = require('../models/book_review');
const ReadingListReview = require('../models/reading_list_review');

describe('FISReviews API', () => {
    beforeAll(() => {
        // Mocking the console.error
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterAll(() => {
        // Restore the console.error
        console.error.mockRestore();
    });
    
    describe('GET /', () => {
        it('should return 200', () => {
            return request(app).get('/').then(response => {
                expect(response.statusCode).toBe(200);
            });
        });
    });

    describe('GET /api/v1/reviews/books', () => {
        beforeEach(() => {
            dbFind = jest.spyOn(BookReview, 'find');
        });
        it('should return all reviews of books',() => {
            const books_reviews = [
                {
                    book_id: 1,
                    user_id: 1,
                    score: 4.5,
                    title: 'Wonderfull summer book',
                    comment: 'What a great summer book, I\'ve loved it! Such a shame the lady on red dies at the end...',
                    createdAt: '2021-06-01T00:00:00.000Z',
                    lastUpdate: '2021-06-01T00:00:00.000Z'
                },
                {
                    book_id: 1,
                    user_id: 2,
                    score: 1,
                    title: 'What was that?!!!',
                    comment: 'No spoilers but this book is sooo dissapointing. A great WTF ending without any explanation and without a reason. \n Won\'t recomend, DO NOT READ!!!!',
                    createdAt: '2021-06-01T00:00:00.000Z',
                    lastUpdate: '2021-06-01T00:00:00.000Z'
                },
                {
                    book_id: 2,
                    user_id: 1,
                    score: 5,
                    title: 'Great book!',
                    comment: 'I loved it!',
                    createdAt: '2021-06-01T00:00:00.000Z',
                    lastUpdate: '2021-06-01T00:00:00.000Z'
                }
            ];
            dbFind.mockImplementation(async () => Promise.resolve(books_reviews));
            return request(app).get("/api/v1/reviews/books").then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(3);
                expect(response.body).toEqual(books_reviews);
                expect(dbFind).toBeCalled();
            });
        });
        it('should return 404 if there are no reviews of books', () => {
            const books_reviews = [];
            dbFind.mockImplementation(async () => Promise.resolve(books_reviews));
            
            return request(app).get("/api/v1/reviews/books").then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "No reviews of books found." });
                expect(dbFind).toBeCalled();
            });
        });
        it('should return 500 if there is a problem with the database',() => {
            dbFind.mockImplementation(async () => Promise.reject(new Error('DB problem')));
            
            return request(app).get("/api/v1/reviews/books").then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFind).toBeCalled();
            });
        });
    });

    describe('GET /api/v1/reviews/reading_lists', () => {
        beforeEach(() => {
            dbFind = jest.spyOn(ReadingListReview, 'find');
        });
        it('should return all reviews of reading lists', () => {
            const reading_lists_reviews = [
                {
                    reading_list_id: 1,
                    user_id: 1,
                    score: 5,
                    comment: 'This list is so cool, I loved it!!!! Thanks @Julia for creating it',
                    createdAt: '2021-06-01T00:00:00.000Z',
                    lastUpdate: '2021-06-01T00:00:00.000Z'
                },
                {
                    reading_list_id: 2,
                    user_id: 1,
                    score: 4,
                    comment: 'It\'s missing my fav book, Madame Bovary, but a pretty cool classic list!',
                    createdAt: '2021-06-01T00:00:00.000Z',
                    lastUpdate: '2021-06-01T00:00:00.000Z'
                },
                {
                    reading_list_id: 2,
                    user_id: 2,
                    score: 0.5,
                    comment: 'How can you call this a classic list without including TKAMB and 1984?!!! 0.5 is being too generous...',
                    createdAt: '2021-06-01T00:00:00.000Z',
                    lastUpdate: '2021-06-01T00:00:00.000Z'
    
                }
            ];
            dbFind.mockImplementation(async() => Promise.resolve(reading_lists_reviews));
            return request(app).get('/api/v1/reviews/reading_lists').then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(3);
                expect(response.body).toEqual(reading_lists_reviews);
                expect(dbFind).toBeCalled();
            });
        });
        it('should return 404 if there are no reviews of reading lists', () => {
            const reading_lists_reviews = [];
            dbFind.mockImplementation(async () => Promise.resolve(reading_lists_reviews));
            
            return request(app).get("/api/v1/reviews/reading_lists").then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "No reviews of reading lists found." });
                expect(dbFind).toBeCalled();
            });
        });
        it('should return 500 if there is a problem with the database',() => {
            dbFind.mockImplementation(async () => Promise.reject(new Error('DB problem')));
            
            return request(app).get("/api/v1/reviews/reading_lists").then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFind).toBeCalled();
            });
        });
    });

    describe('GET /api/v1/reviews/books/bk/:bookID', () => {
        beforeEach(() => {
            dbFind = jest.spyOn(BookReview, 'find');
        });

        it('should return all reviews of a specified book', () => {
            const bookId=1;
            const book_reviews = [
                {
                    book_id: bookId,
                    user_id: 1,
                    score: 4.5,
                    title: 'Wonderfull summer book',
                },
                {
                    book_id: bookId,
                    user_id: 2,
                    score: 1,
                    title: 'What was that?!!!',
                }
            ];
            dbFind.mockImplementation(async () => Promise.resolve(book_reviews));
            return request(app).get('/api/v1/reviews/books/bk/1').then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(2);
                expect(response.body).toEqual(book_reviews);
                expect(dbFind).toBeCalled();
            });
        });
        it('should return 404 if there are no reviews of the specified book', () => {
            const book_reviews = [];
            dbFind.mockImplementation(async () => Promise.resolve(book_reviews));
            
            return request(app).get("/api/v1/reviews/books/bk/1").then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "No reviews found for this book." });
                expect(dbFind).toBeCalled();
            });
        });
        it('should return 500 if there is a problem with the database',() => {
            dbFind.mockImplementation(async () => Promise.reject(new Error('DB problem')));
            
            return request(app).get("/api/v1/reviews/books/bk/1").then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFind).toBeCalled();
            });
        });
    });

    describe('GET /api/v1/reviews/reading_lists/rl/:readingListID', () => {
        beforeEach(() => {  
            dbFind = jest.spyOn(ReadingListReview, 'find');
        });

        it('should return all reviews of a specified reading list', () => {
            const readingListId = 1;
            const reading_list_reviews = [
                {
                    reading_list_id: readingListId,
                    user_id: 1,
                    score: 5,
                    comment: 'This list is so cool, I loved it!!!! Thanks @Julia for creating it',
                },
                {
                    reading_list_id: readingListId,
                    user_id: 2,
                    score: 4,
                    comment: 'It\'s missing my fav book, Madame Bovary, but a pretty cool classic list!',
                }
            ];
            dbFind.mockImplementation(async () => Promise.resolve(reading_list_reviews));
            return request(app).get('/api/v1/reviews/reading_lists/rl/1').then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(2);
                expect(response.body).toEqual(reading_list_reviews);
                expect(dbFind).toBeCalled();
            });
        });
        it('should return 404 if there are no reviews of the specified reading list', () => {
            const reading_list_reviews = [];
            dbFind.mockImplementation(async () => Promise.resolve(reading_list_reviews));
            
            return request(app).get("/api/v1/reviews/reading_lists/rl/1").then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "No reviews found for this reading list." });
                expect(dbFind).toBeCalled();
            });
        });
        it('should return 500 if there is a problem with the database',() => {
            dbFind.mockImplementation(async () => Promise.reject(new Error('DB problem')));
            return request(app).get("/api/v1/reviews/reading_lists/rl/1").then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFind).toBeCalled();
            });
        });
    });

    describe('GET /api/v1/reviews/books/rev/:reviewID', () => {
        beforeEach(() => {
            dbFindById = jest.spyOn(BookReview, 'findById');
        });
        it('should return the specified review of a book if everything is ok', () => {
            const reviewID = 1;
            const bookReview = {
                book_id: 1,
                user_id: 1,
                score: 5,
                title: 'Great book!',
                comment: 'I loved it!'
            };
            dbFindById.mockImplementation(async () => Promise.resolve(bookReview));
            return request(app).get(`/api/v1/reviews/books/rev/${reviewID}`).then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual(bookReview);
                expect(dbFindById).toBeCalled();
            });                                                                  
        });
        it('should return 404 if the specified review of the book is not found', () => {
            const reviewID = 1;
            const bookReview = null;
            dbFindById.mockImplementation(async () => Promise.resolve(bookReview));
            return request(app).get(`/api/v1/reviews/books/rev/${reviewID}`).then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "Review not found." });
                expect(dbFindById).toBeCalled();
            });
        });
        it('should return 500 if there is a problem with the database', () => {
            const reviewID = 1;
            dbFindById.mockImplementation(async () => Promise.reject(new Error('DB problem')));
            return request(app).get(`/api/v1/reviews/books/rev/${reviewID}`).then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFindById).toBeCalled();
            });
        });
    });

    describe('GET /api/v1/reviews/reading_lists/rev/:reviewID', () => {
        beforeEach(() => {
            dbFindById = jest.spyOn(ReadingListReview, 'findById');
        });
        it('should return the specified review of a reading list if everything is ok', () => {
            const reviewID = 1;
            const readingListReview = {
                reading_list_id: 1,
                user_id: 1,
                score: 5,
                comment: 'Great reading list!'
            };
            dbFindById.mockImplementation(async () => Promise.resolve(readingListReview));
            return request(app).get(`/api/v1/reviews/reading_lists/rev/${reviewID}`).then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual(readingListReview);
                expect(dbFindById).toBeCalled();
            });
        });
        it('should return 404 if the specified review of the reading list is not found', () => {
            const reviewID = 1;
            const readingListReview = null;
            dbFindById.mockImplementation(async () => Promise.resolve(readingListReview));
            return request(app).get(`/api/v1/reviews/reading_lists/rev/${reviewID}`).then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "Review not found." });
                expect(dbFindById).toBeCalled();
            });
        });
        it('should return 500 if there is a problem with the database', () => {
            const reviewID = 1;
            dbFindById.mockImplementation(async () => Promise.reject(new Error('DB problem')));
            return request(app).get(`/api/v1/reviews/reading_lists/rev/${reviewID}`).then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFindById).toBeCalled();
            });
        });
    });

    describe('POST /api/v1/reviews/books', () => {
        beforeEach(() => {
            dbSave = jest.spyOn(BookReview.prototype, 'save');
        });
        const bookReview = {
            book_id: 1,
            user_id: 1,
            score: 5,
            title: 'Great book!',
            comment: 'I loved it!'
        };

        it('should add a review of a book is everything is ok', () => {
            dbSave.mockImplementation(async () => Promise.resolve(true));
            return request(app).post('/api/v1/reviews/books').send(bookReview).then(response => {
                expect(response.statusCode).toBe(201);
                expect(dbSave).toBeCalled();
            });
        });
        it('should return 500 if there is a problem with the database', () => {
            dbSave.mockImplementation(async () => Promise.reject(new Error('DB problem')));
            return request(app).post('/api/v1/reviews/books').send(bookReview).then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbSave).toBeCalled();
            });
        });
        it('should return 400 if the review of the book is not valid', () => {
            const bookReview = {
                score: '5kjhkh',
                title: 'Great book!',
                comment: 'I loved it!'
            };
            dbSave.mockImplementation(async () => Promise.reject({ name: 'ValidationError', message: 'ValidationError' }));
            return request(app).post('/api/v1/reviews/books').send(bookReview).then(response => {
                expect(response.statusCode).toBe(400);
                expect(response.text).toBe('ValidationError');
            });
        });
    });

    describe('POST /api/v1/reviews/reading_lists', () => {
        beforeEach(() => {
            dbSave = jest.spyOn(ReadingListReview.prototype, 'save');
        });
        const readingListReview = {
            reading_list_id: 1,
            user_id: 1,
            score: 5,
            comment: 'Great reading list!'
        };
        it('should add a review of a reading list is everything is ok', () => {
            dbSave.mockImplementation(async () => Promise.resolve(true));
            return request(app).post('/api/v1/reviews/reading_lists').send(readingListReview).then(response => {
                expect(response.statusCode).toBe(201);
                expect(dbSave).toBeCalled();
            });
        });
        it('should return 500 if there is a problem with the database', () => {
            dbSave.mockImplementation(async () => Promise.reject(new Error('DB problem')));
            return request(app).post('/api/v1/reviews/reading_lists').send(readingListReview).then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbSave).toBeCalled();
            });
        });
        it('should return 400 if the review of the reading list is not valid', () => {
            const readingListReview = {
                score: '5kjhkh',
                comment: 'Great reading list!'
            };
            dbSave.mockImplementation(async () => Promise.reject({ name: 'ValidationError', message: 'ValidationError' }));
            return request(app).post('/api/v1/reviews/reading_lists').send(readingListReview).then(response => {
                expect(response.statusCode).toBe(400);
                expect(response.text).toBe('ValidationError');
            });
        });
    });

    describe('PUT /api/v1/reviews/books/:reviewID', () => {
        beforeEach(() => {
            dbFindByIdAndUpdate = jest.spyOn(BookReview, 'findByIdAndUpdate');
        });
        it('should update a review of a book if everything is ok', () => {
            const reviewID = 1;
            const updatedReview = {
                score: 5,
                title: 'Great book!',
                comment: 'I loved it!',
            };
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.resolve(updatedReview));
            return request(app).put(`/api/v1/reviews/books/${reviewID}`).send(updatedReview).then(response => {
                expect(response.statusCode).toBe(201);
                expect(response.body).toEqual(updatedReview);
                expect(dbFindByIdAndUpdate).toBeCalled();
            });
        });
        it('should return 404 if the review of the book is not found', () => {
            const reviewID = 1;
            const updatedReview = null;
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.resolve(updatedReview));
            return request(app).put(`/api/v1/reviews/books/${reviewID}`).send(updatedReview).then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "Review not found." });
                expect(dbFindByIdAndUpdate).toBeCalled();
            });
        });
        it('should return 400 if the review of the book is not valid', () => {
            const reviewID = 1;
            const updatedReview = {
                score: '5kjhkh',
                title: 'Great book!',
                comment: 'I loved it!',
            };
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.reject({ name: 'ValidationError', message: 'Validation error' }));
            return request(app).put(`/api/v1/reviews/books/${reviewID}`).send(updatedReview).then(response => {
                expect(response.statusCode).toBe(400);
                expect(response.text).toBe('Validation error');
                expect(dbFindByIdAndUpdate).toBeCalled();
            });

        });
        it('should return 500 if there is a problem with the database', () => {
            const reviewID = 1;
            const updatedReview = {
                score: 5,
                title: 'Great book!',
                comment: 'I loved it!',
            };
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.reject(new Error('DB problem')));
            return request(app).put(`/api/v1/reviews/books/${reviewID}`).send(updatedReview).then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFindByIdAndUpdate).toBeCalled();
            });
        });
    });

    describe('PUT /api/v1/reviews/reading_lists/:reviewID', () => {
        beforeEach(() => {
            dbFindByIdAndUpdate = jest.spyOn(ReadingListReview, 'findByIdAndUpdate');
        });
        it('should update a review of a reading list if everything is ok', () => {
            const reviewID = 1;
            const updatedReview = {
                score: 5,
                comment: 'Great reading list!',
            };
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.resolve(updatedReview));
            return request(app).put(`/api/v1/reviews/reading_lists/${reviewID}`).send(updatedReview).then(response => {
                expect(response.statusCode).toBe(201);
                expect(response.body).toEqual(updatedReview);
                expect(dbFindByIdAndUpdate).toBeCalled();
            });
        });
        it('should return 404 if the review of the reading list is not found', () => {
            const reviewID = 1;
            const updatedReview = null;
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.resolve(updatedReview));
            return request(app).put(`/api/v1/reviews/reading_lists/${reviewID}`).send(updatedReview).then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "Review not found." });
                expect(dbFindByIdAndUpdate).toBeCalled();
            });
        });
        it('should return 400 if the review of the reading list is not valid', () => {
            const reviewID = 1;
            const updatedReview = {
                score: '5kjhkh',
                comment: 'Great reading list!',
            };
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.reject({ name: 'ValidationError', message: 'Validation error' }));
            return request(app).put(`/api/v1/reviews/reading_lists/${reviewID}`).send(updatedReview).then(response => {
                expect(response.statusCode).toBe(400);
                expect(response.text).toBe('Validation error');
                expect(dbFindByIdAndUpdate).toBeCalled();
            });
        });
        it('should return 500 if there is a problem with the database', () => {
            const reviewID = 1;
            const updatedReview = {
                score: 5,
                comment: 'Great reading list!',
            };
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.reject(new Error('DB problem')));
            return request(app).put(`/api/v1/reviews/reading_lists/${reviewID}`).send(updatedReview).then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFindByIdAndUpdate).toBeCalled();
            });
        });
    });

    describe('DELETE /api/v1/reviews/books/:reviewID', () => {
        beforeEach(() => {
            dbDeleteById = jest.spyOn(BookReview, 'findByIdAndDelete');
        });
        it('should delete a review of a book if everything is ok', () => {
            const reviewID = 1;
            const deletedReview = {
                book_id: 1,
                user_id: 1,
                score: 5,
                title: 'Great book!',
                comment: 'I loved it!'
            }
            dbDeleteById.mockImplementation(async () => Promise.resolve(deletedReview));
            return request(app).delete(`/api/v1/reviews/books/${reviewID}`).then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual({ message: "Book Review deleted successfully." });
                expect(dbDeleteById).toBeCalled();
            });
        });
        it('should return 404 if the review of the book to delete is not found', () => {
            const reviewID = 1;
            const deletedReview = null;
            dbDeleteById.mockImplementation(async () => Promise.resolve(deletedReview));
            return request(app).delete(`/api/v1/reviews/books/${reviewID}`).then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "Book Review not found." });
                expect(dbDeleteById).toBeCalled();
            });
        });
        it('should return 500 if there is a problem with the database', () => {
            const reviewID = 1;
            dbDeleteById.mockImplementation(async () => Promise.reject(new Error('DB problem')));
            return request(app).delete(`/api/v1/reviews/books/${reviewID}`).then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbDeleteById).toBeCalled();
            });
        });
    });
    
    describe('DELETE /api/v1/reviews/reading_lists/:reviewID', () => {
        beforeEach(() => {
            dbDeleteById = jest.spyOn(ReadingListReview, 'findByIdAndDelete');
        });
        it('should delete a review of a reading list if everything is ok', () => {
            const reviewID = 1;
            const deletedReview = {
                reading_list_id: 1,
                user_id: 1,
                score: 5,
                comment: 'Great reading list!'
            }
            dbDeleteById.mockImplementation(async () => Promise.resolve(deletedReview));
            return request(app).delete(`/api/v1/reviews/reading_lists/${reviewID}`).then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual({ message: "Reading list review deleted successfully." });
                expect(dbDeleteById).toBeCalled();
            });
        });
        it('should return 404 if the review of the reading list to delete is not found', () => {
            const reviewID = 1;
            const deletedReview = null;
            dbDeleteById.mockImplementation(async () => Promise.resolve(deletedReview));
            return request(app).delete(`/api/v1/reviews/reading_lists/${reviewID}`).then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "Reading list review not found." });
                expect(dbDeleteById).toBeCalled();
            });
        });
        it('should return 500 if there is a problem with the database', () => {
            const reviewID = 1;
            dbDeleteById.mockImplementation(async () => Promise.reject(new Error('DB problem')));
            return request(app).delete(`/api/v1/reviews/reading_lists/${reviewID}`).then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbDeleteById).toBeCalled();
            });
        });
    });
});
