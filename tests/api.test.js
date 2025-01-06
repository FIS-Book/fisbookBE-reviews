const app= require('../app');
const request = require('supertest');
const util_services = require('../services/util_services');

const BookReview = require('../models/book_review');
const ReadingListReview = require('../models/reading_list_review');

jest.setTimeout(30000);
jest.mock('../authentication/authenticateAndAuthorize', () => {
    return jest.fn((roles)=> (req, res, next) => {
        req.user = {
            _id: '1234567890abcdef12345678',
            nombre: 'Test',
            apellidos: 'User',
            username: 'testuser',
            email: 'test@example.com',
            plan: 'free',
            rol: 'Admin'
          };
        next();
    });
});

jest.mock('../services/util_services',( ) => ({
    getUserInfo: jest.fn(() => {return {name: 'Julia', surname: 'Smith'}}),
    updateBookScore: jest.fn(() => { }),
    updateReadingListScore: jest.fn(() => { }),
    getBookTitle: jest.fn(() => { return 'Great Gatbsy'; }),
    getReadingListTitle: jest.fn(() => { return 'Harry Potter list'; })
}));

describe('FISReviews API', () => {
    beforeAll(() => {
        // Mocking the console.error
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterAll(() => {
        // Restore the console.error
        console.error.mockRestore();
    });

    describe('GET /api/v1/reviews/',() => {
        const book_reviews = [
            new BookReview(
            {
                book_id: '1',
                user_id: '1',
                score: 4.5,
                title: 'Wonderfull summer book',
                comment: 'I really enjoyed this book. It was a great summer read!',
            }),
            new BookReview(
            {
                book_id: '2',
                user_id: '2',
                score: 1,
                title: 'What was that?!!!',
                comment: 'I did not enjoy this book at all. It was a waste of time!',
            })
        ];
        const reading_list_reviews = [
            new ReadingListReview(
            {
                reading_list_id: '1',
                user_id: '1',
                score: 5,
                comment: 'This list is so cool, I loved it!!!! Thanks @Julia for creating it',
            }),
            new ReadingListReview(
            {
                reading_list_id: '2',
                user_id: '2',
                score: 4,
                comment: 'It\'s missing my fav book, Madame Bovary, but a pretty cool classic list!',
            })
        ];
        //const reviews = {book_reviews, reading_list_reviews};
        beforeEach(() => {
            jest.clearAllMocks();
            dbFindBk = jest.spyOn(BookReview, 'find');
            dbFindRl = jest.spyOn(ReadingListReview, 'find');
        });
        it('Should return 200 and all reviews if everything is ok', async () => {
            dbFindBk.mockImplementation(() => Promise.resolve(book_reviews));
            dbFindRl.mockImplementation(() => Promise.resolve(reading_list_reviews));
            return await request(app).get('/api/v1/reviews').set('Authorization','Bearer token').then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual(
                    {book_reviews: book_reviews.map(review => ({
                        ...review._doc,
                        _id: review._id.toString(),
                        createdAt: review.createdAt.toISOString(),
                        lastUpdate: review.lastUpdate.toISOString(),
                    })),
                    reading_list_reviews: reading_list_reviews.map(review => ({
                        ...review._doc,
                        _id: review._id.toString(),
                        createdAt: review.createdAt.toISOString(),
                        lastUpdate: review.lastUpdate.toISOString(),
                    }))
                });
            });
        });
        it('Should return 500 if there are no reviews', async () => {
            dbFindBk.mockImplementation(() => Promise.reject(new Error('DB problem')));
            return await request(app).get('/api/v1/reviews').set('Authorization','Bearer token').then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFindBk).toBeCalled();
            });
        });
    });

    describe('GET /api/v1/reviews/books/', () => {
        const book_reviews = [
            new BookReview(
            {
                book_id: '1',
                user_id: '1',
                score: 4,
                title: 'Wonderfull summer book',
                comment: 'I really enjoyed this book. It was a great summer read!',
            }),
            new BookReview(
            {
                book_id: '2',
                user_id: '2',
                score: 1,
                title: 'What was that?!!!',
                comment: 'I did not enjoy this book at all. It was a waste of time!',
            })
        ];
        var dbFind;
        beforeEach(() => {
            jest.clearAllMocks();
            dbFind = jest.spyOn(BookReview, 'find');
        });

        it('Should return 200 and all reviews of books if everything is ok', async () => {
            dbFind.mockImplementation(() => Promise.resolve(book_reviews));
            return await request(app).get('/api/v1/reviews/books').set('Authorization','Bearer token').then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(2);
                expect(response.body).toEqual(
                    book_reviews.map(review => ({
                        ...review._doc,
                        _id: review._id.toString(),
                        createdAt: review.createdAt.toISOString(),
                        lastUpdate: review.lastUpdate.toISOString(),
                    }))
                );
                expect(dbFind).toBeCalled();
            });
        });
        it('Should return 500 if there are no reviews of books', async () => {
            dbFind.mockImplementation(() => Promise.reject(new Error('DB problem')));
            return await request(app).get('/api/v1/reviews/books').set('Authorization','Bearer token').then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFind).toBeCalled();
            });
        });
        it('Should return 404 if there are no reviews of books', async () => {
            const book_reviews = [];
            dbFind.mockImplementation(() => Promise.resolve(book_reviews));
            return await request(app).get('/api/v1/reviews/books').set('Authorization','Bearer token').then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "No reviews of books found." });
                expect(dbFind).toBeCalled();
            });
        });
    });
    describe('GET /api/v1/reviews/reading_lists/', () => {
        const reading_list_reviews = [
            new ReadingListReview(
            {
                reading_list_id: '1',
                user_id: '1',
                score: 5,
                comment: 'This list is so cool, I loved it!!!! Thanks @Julia for creating it',
            }),
            new ReadingListReview(
            {
                reading_list_id: '2',
                user_id: '2',
                score: 4,
                comment: 'It\'s missing my fav book, Madame Bovary, but a pretty cool classic list!',
            })
        ];
        var dbFind;
        beforeEach(() => {
            jest.clearAllMocks();
            dbFind = jest.spyOn(ReadingListReview, 'find');
        });

        it('Should return 200 and all reviews of reading lists if everything is ok', async () => {
            dbFind.mockImplementation(() => Promise.resolve(reading_list_reviews));
            return await request(app).get('/api/v1/reviews/reading_lists').set('Authorization','Bearer token').then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(2);
                expect(response.body).toEqual(
                    reading_list_reviews.map(review => ({
                        ...review._doc,
                        _id: review._id.toString(),
                        createdAt: review.createdAt.toISOString(),
                        lastUpdate: review.lastUpdate.toISOString(),
                    }))
                );
                expect(dbFind).toBeCalled();
            });
        });
        it('Should return 500 if there are no reviews of reading lists', async () => {
            dbFind.mockImplementation(() => Promise.reject(new Error('DB problem')));
            return await request(app).get('/api/v1/reviews/reading_lists').set('Authorization','Bearer token').then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFind).toBeCalled();
            });
        });
        it('Should return 404 if there are no reviews of reading lists', async () => {
            const reading_list_reviews = [];
            dbFind.mockImplementation(() => Promise.resolve(reading_list_reviews));
            return await request(app).get('/api/v1/reviews/reading_lists').set('Authorization','Bearer token').then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "No reviews of reading lists found." });
                expect(dbFind).toBeCalled();
            });
        });
    });

    describe('GET /api/v1/reviews/books/bk/:bookID', () => {
        const bookId = 'bk_id';
        const book_reviews = [
            new BookReview(
            {
                book_id: bookId,
                score: 4.5,
                title: 'Wonderfull summer book',
                comment: 'I really enjoyed this book. It was a great summer read!',
                //user: {name: 'Julia', surname: 'Smith'},
                user_id: '1'
            }),
            new BookReview(
            {
                book_id: bookId,
                score: 1,
                title: 'What was that?!!!',
                comment: 'I did not enjoy this book at all. It was a waste of time!',
                //user: {name: 'Julia', surname: 'Smith'},
                user_id: '2'
            })
        ];
        var dbFind;
        beforeEach(() => {
            jest.clearAllMocks();
            dbFind = jest.spyOn(BookReview, 'find');
        });

        it('Should return 200 and the list of reviews of the specified book', async () => {
            dbFind.mockImplementation(() => Promise.resolve(book_reviews));
            return await request(app)
                .get(`/api/v1/reviews/books/bk/${bookId}`).set('Authorization','Bearer token')
                .then(response => {
                    expect(response.statusCode).toBe(200);
                    expect(response.body).toBeArrayOfSize(2);
                    expect(response.body).toEqual(
                        book_reviews.map(review => ({
                            ...review._doc,
                            _id: review._id.toString(),
                            createdAt: review.createdAt.toISOString(),
                            lastUpdate: review.lastUpdate.toISOString(),
                            user: { name: 'Julia', surname: 'Smith' }
                    })));
                    expect(dbFind).toBeCalled();
                    expect(util_services.getUserInfo).toBeCalled();
                });
        });
        it('Should return 404 if there are no reviews of the specified book', async () => {
            const book_reviews = [];
            dbFind.mockImplementation(() => Promise.resolve(book_reviews));
            return await request(app).get(`/api/v1/reviews/books/bk/${bookId}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "No reviews found for this book." });
                expect(dbFind).toBeCalled();
            });
        });
        it('Should return 500 if there is a problem with the database', async () => {
            dbFind.mockImplementation(() => Promise.reject(new Error('DB problem')));
            return await request(app).get(`/api/v1/reviews/books/bk/${bookId}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFind).toBeCalled();
            });
        });

    });

    describe('GET /api/v1/reviews/reading_lists/rl/:readingListID', () => {
        beforeEach(() => {  
            jest.clearAllMocks();
            dbFind = jest.spyOn(ReadingListReview, 'find');
        });

        it('Should return 200 and all reviews of a specified reading list', async () => {
            const readingListId = 'rl_id';
            const reading_list_reviews = [
                new ReadingListReview(
                {
                    reading_list_id: readingListId,
                    user_id: '1',
                    score: 5,
                    comment: 'This list is so cool, I loved it!!!! Thanks @Julia for creating it',
                }),
                new ReadingListReview(
                {
                    reading_list_id: readingListId,
                    user_id: '2',
                    score: 4,
                    comment: 'It\'s missing my fav book, Madame Bovary, but a pretty cool classic list!',
                })
            ];
            dbFind.mockImplementation(() => Promise.resolve(reading_list_reviews));
            return await request(app).get(`/api/v1/reviews/reading_lists/rl/${readingListId}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(2);
                expect(response.body).toEqual(
                    reading_list_reviews.map(review => ({
                        ...review._doc,
                        _id: review._id.toString(),
                        createdAt: review.createdAt.toISOString(),
                        lastUpdate: review.lastUpdate.toISOString(),
                        user: { name: 'Julia', surname: 'Smith' }
                })));
                expect(dbFind).toBeCalled();
            });
        });
        it('Should return 404 if there are no reviews of the specified reading list', async () => {
            const readingListId = 'rl_id';
            const reading_list_reviews = [];
            dbFind.mockImplementation(() => Promise.resolve(reading_list_reviews));
            
            return await request(app).get(`/api/v1/reviews/reading_lists/rl/${readingListId}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "No reviews found for this reading list." });
                expect(dbFind).toBeCalled();
            });
        });
        it('Should return 500 if there is a problem with the database', async () => {
            const readingListId = 'rl_id';
            dbFind.mockImplementation(async () => Promise.reject(new Error('DB problem')));
            return await request(app).get(`/api/v1/reviews/reading_lists/rl/${readingListId}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFind).toBeCalled();
            });
        });
    });

    describe('GET /api/v1/reviews/reading_lists/rev/:reviewID', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            dbFindById = jest.spyOn(ReadingListReview, 'findById');
        });
        it('Should return 200 and the specified review of a reading list if everything is ok', async () => {
            const readingListReview = new ReadingListReview({
                reading_list_id: '1',
                user_id: '1',
                score: 5,
                comment: 'Great reading list!'
            });
            const reviewID = readingListReview._id;
            dbFindById.mockImplementation(() => Promise.resolve(readingListReview));
            return await request(app).get(`/api/v1/reviews/reading_lists/rev/${reviewID}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual(
                    {   
                    ...readingListReview._doc,
                    _id: reviewID.toString(),
                    createdAt: readingListReview.createdAt.toISOString(),
                    lastUpdate: readingListReview.lastUpdate.toISOString(),
                    }
                );
                expect(dbFindById).toBeCalled();
            });
        });
        it('Should return 404 if the specified review of the reading list is not found', async () => {
            const reviewID = "rev_id";
            const readingListReview = null;
            dbFindById.mockImplementation(() => Promise.resolve(readingListReview));
            return await request(app).get(`/api/v1/reviews/reading_lists/rev/${reviewID}`).then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "Review not found." });
                expect(dbFindById).toBeCalled();
            });
        });
        it('Should return 500 if there is a problem with the database', async () => {
            const reviewID = "rev_id";
            dbFindById.mockImplementation(async () => Promise.reject(new Error('DB problem')));
            return await request(app).get(`/api/v1/reviews/reading_lists/rev/${reviewID}`).then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFindById).toBeCalled();
            });
        });
    });

    describe('GET /api/v1/reviews/books/rev/:reviewID', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            dbFindById = jest.spyOn(BookReview, 'findById');
        });
        it('Should return 200 and the specified review of a book if everything is ok', async () => {
            const bookReview = new BookReview({
                book_id: '1',
                user_id: '1',
                score: 5,
                title: 'Great book!',
                comment: 'I loved it!'
            });
            const reviewID = bookReview._id;
            dbFindById.mockImplementation(() => Promise.resolve(bookReview));
            return await request(app).get(`/api/v1/reviews/books/rev/${reviewID}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual(
                    {   
                    ...bookReview._doc,
                    _id: reviewID.toString(),
                    createdAt: bookReview.createdAt.toISOString(),
                    lastUpdate: bookReview.lastUpdate.toISOString(),
                    }
                );
                expect(dbFindById).toBeCalled();
            });
        });
        it('Should return 404 if the specified review of the book is not found', async () => {
            const reviewID = "rev_id";
            const bookReview = null;
            dbFindById.mockImplementation(() => Promise.resolve(bookReview));
            return await request(app).get(`/api/v1/reviews/books/rev/${reviewID}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "Review not found." });
                expect(dbFindById).toBeCalled();
            });
        });
        it('Should return 500 if there is a problem with the database', async () => {
            const reviewID = "rev_id";
            dbFindById.mockImplementation(() => Promise.reject(new Error('DB problem')));
            return await request(app).get(`/api/v1/reviews/books/rev/${reviewID}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFindById).toBeCalled();
            });
        });
    });
    describe('GET /api/v1/reviews/users/:userID/bk', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            dbFind = jest.spyOn(BookReview, 'find');
        });
        it('Should return 200 and all reviews of a specified user for books', async () => {
            const userId = 'user_id';
            const book_reviews = [
                new BookReview(
                {
                    book_id: '1',
                    user_id: userId,
                    score: 4.5,
                    title: 'Wonderfull summer book',
                    comment: 'I really enjoyed this book. It was a great summer read!',
                }),
                new BookReview(
                {
                    book_id: '2',
                    user_id: userId,
                    score: 1,
                    title: 'What was that?!!!',
                    comment: 'I did not enjoy this book at all. It was a waste of time!',
                })
            ];
            dbFind.mockImplementation(() => Promise.resolve(book_reviews));
            return await request(app).get(`/api/v1/reviews/users/${userId}/bk`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(2);
                expect(response.body).toEqual(
                    book_reviews.map(review => ({
                        ...review._doc,
                        _id: review._id.toString(),
                        createdAt: review.createdAt.toISOString(),
                        lastUpdate: review.lastUpdate.toISOString(),
                        bookTitle: 'Great Gatbsy'
                })));
                expect(dbFind).toBeCalled();
                expect(util_services.getBookTitle).toBeCalled();
            });
        });
        it('Should return 404 if there are no reviews of the specified user for books', async () => {
            const userId = 'user_id';
            const book_reviews = [];
            dbFind.mockImplementation(() => Promise.resolve(book_reviews));
            return await request(app).get(`/api/v1/reviews/users/${userId}/bk`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "No book reviews found for this user." });
                expect(dbFind).toBeCalled();
            });
        });
        it('Should return 500 if there is a problem with the database', async () => {
            const userId = 'user_id';
            dbFind.mockImplementation(() => Promise.reject(new Error('DB problem')));
            return await request(app).get(`/api/v1/reviews/users/${userId}/bk`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFind).toBeCalled();
            });
        });
    });

    describe('GET /api/v1/reviews/users/:userID/rl', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            dbFind = jest.spyOn(ReadingListReview, 'find');
        });
        it('Should return 200 and all reviews of a specified user for reading lists', async () => {
            const userId = 'user_id';
            const reading_list_reviews = [
                new ReadingListReview(
                {
                    reading_list_id: '1',
                    user_id: userId,
                    score: 5,
                    comment: 'This list is so cool, I loved it!!!! Thanks @Julia for creating it',
                }),
                new ReadingListReview(
                {
                    reading_list_id: '2',
                    user_id: userId,
                    score: 4,
                    comment: 'It\'s missing my fav book, Madame Bovary, but a pretty cool classic list!',
                })
            ];
            dbFind.mockImplementation(() => Promise.resolve(reading_list_reviews));
            return await request(app).get(`/api/v1/reviews/users/${userId}/rl`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(2);
                expect(response.body).toEqual(
                    reading_list_reviews.map(review => ({
                        ...review._doc,
                        _id: review._id.toString(),
                        createdAt: review.createdAt.toISOString(),
                        lastUpdate: review.lastUpdate.toISOString(),
                        readingTitle: 'Harry Potter list'
                })));
                expect(dbFind).toBeCalled();
                expect(util_services.getReadingListTitle).toBeCalled();
            });
        });
        it('Should return 404 if there are no reviews of the specified user for reading lists', async () => {
            const userId = 'user_id';
            const reading_list_reviews = [];
            dbFind.mockImplementation(() => Promise.resolve(reading_list_reviews));
            return await request(app).get(`/api/v1/reviews/users/${userId}/rl`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "No reading list reviews found for this user." });
                expect(dbFind).toBeCalled();
            });
        });
        it('Should return 500 if there is a problem with the database', async () => {
            const userId = 'user_id';
            dbFind.mockImplementation(() => Promise.reject(new Error('DB problem')));
            return await request(app).get(`/api/v1/reviews/users/${userId}/rl`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFind).toBeCalled();
            });
        });
    });

    describe('PUT /api/v1/reviews/books/:reviewID', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockSession = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn()
            };
            dbSession=jest.spyOn(BookReview, 'startSession');
            dbFindByIdAndUpdate=jest.spyOn(BookReview, 'findByIdAndUpdate');
            dbSave=jest.spyOn(BookReview.prototype, 'save');
        });
        it('Should return 200 and update the specified review of a book if everything is ok', async () => {
            const bookReview = new BookReview({
                book_id: '1',
                user_id: '1',
                score: 4,
                title: 'Good book!',
                comment: 'I like it!'
            });
            const bookReviewUpdate = {
                score: 4,
                title: 'Good book!',
                comment: 'I like it!'
            };
            const reviewID = bookReview._id;
            newdate= new Date().toISOString();
            dbFindByIdAndUpdate.mockImplementation(() => Promise.resolve({...bookReview._doc, lastUpdate: newdate}));
            dbSave.mockImplementation(() => Promise.resolve(true));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            return await request(app).put(`/api/v1/reviews/books/${reviewID}`).set('Authorization', 'Bearer token').send(bookReviewUpdate).then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual(
                    {   
                    ...bookReview._doc,
                    _id: reviewID.toString(),
                    createdAt: bookReview.createdAt.toISOString(),
                    lastUpdate: newdate
                    }
                );
                expect(dbFindByIdAndUpdate).toBeCalled();
                expect(util_services.updateBookScore).toHaveBeenCalled();
                expect(mockSession.startTransaction).toHaveBeenCalled();
                expect(mockSession.commitTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });
        it('Should return 404 if the specified review of the book is not found', async () => {
            const reviewID = "rev_id";
            const bookReviewUpdate = {
                score: 5,
                title: 'Great book!',
                comment: 'I loved it!'
            };
            const bookReview = null;
            dbFindByIdAndUpdate.mockImplementation(() => Promise.resolve(bookReview));
            return await request(app).put(`/api/v1/reviews/books/${reviewID}`).set('Authorization', 'Bearer token').send(bookReviewUpdate).then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "Review not found." });
                expect(dbFindByIdAndUpdate).toBeCalled();
                expect(mockSession.abortTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });
        it('Should return 500 if there is a problem with the database', async () => {
            const reviewID = "rev_id";
            const bookReviewUpdate = {
                score: 5,
                title: 'Great book!',
                comment: 'I loved it!'
            };
            dbFindByIdAndUpdate.mockImplementation(() => Promise.reject(new Error('DB problem')));
            return await request(app).put(`/api/v1/reviews/books/${reviewID}`).set('Authorization', 'Bearer token').send(bookReviewUpdate).then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFindByIdAndUpdate).toBeCalled();
                expect(mockSession.abortTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });
        it('Should return 500 if there is a problem in updating the book score', async () => {
            const reviewID = "rev_id";
            const bookReview = new BookReview({
                book_id: '1',
                user_id: '1',
                score: 5,
                title: 'Great book!',
                comment: 'I loved it!'
            });
            const bookReviewUpdate = {
                score: 5,
                title: 'Great book!',
                comment: 'I loved it!'
            };
            dbFindByIdAndUpdate.mockImplementation(() => Promise.resolve(bookReview));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            util_services.updateBookScore.mockImplementation(() => { throw new Error('Error in the update of the score'); });
            return await request(app).put(`/api/v1/reviews/books/${reviewID}`).set('Authorization', 'Bearer token').send(bookReviewUpdate).then(response => {
                expect(response.statusCode).toBe(500);
                expect(util_services.updateBookScore).toHaveBeenCalled();
                expect(mockSession.abortTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });
    });

    describe('PUT /api/v1/reviews/reading_lists/:reviewID', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockSession = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn()
            };
            dbSession=jest.spyOn(ReadingListReview, 'startSession');
            dbFindByIdAndUpdate=jest.spyOn(ReadingListReview, 'findByIdAndUpdate');
            dbSave=jest.spyOn(ReadingListReview.prototype, 'save');
        });
        it('Should return 200 and update the specified review of a reading list if everything is ok', async () => {
            const readingListReview = new ReadingListReview({
                reading_list_id: '1',
                user_id: '1',
                score: 5,
                comment: 'Great reading list!'
            });
            const readingListReviewUpdate = {
                score: 5,
                comment: 'Great reading list!'
            }
            const reviewID = readingListReview._id;
            newdate= new Date().toISOString();
            dbFindByIdAndUpdate.mockImplementation(() => Promise.resolve({...readingListReview._doc, lastUpdate: newdate}));
            dbSave.mockImplementation(() => Promise.resolve(true));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            return await request(app).put(`/api/v1/reviews/reading_lists/${reviewID}`).set('Authorization', 'Bearer token').send(readingListReviewUpdate).then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual(
                    {   
                    ...readingListReview._doc,
                    _id: reviewID.toString(),
                    createdAt: readingListReview.createdAt.toISOString(),
                    lastUpdate: newdate
                    }
                );
                expect(dbFindByIdAndUpdate).toBeCalled();
                expect(util_services.updateReadingListScore).toHaveBeenCalled();
                expect(mockSession.startTransaction).toHaveBeenCalled();
                expect(mockSession.commitTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });
        it('Should return 404 if the specified review of the reading list is not found', async () => {
            const reviewID = "rev_id";
            const readingListReview = null;
            const readingListReviewUpdate = {
                score: 5,
                comment: 'Great reading list!'
            }
            dbFindByIdAndUpdate.mockImplementation(() => Promise.resolve(readingListReview));
            return await request(app).put(`/api/v1/reviews/reading_lists/${reviewID}`).set('Authorization', 'Bearer token').send(readingListReviewUpdate).then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "Review not found." });
                expect(dbFindByIdAndUpdate).toBeCalled();
                expect(mockSession.abortTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });
        it('Should return 500 if there is a problem with the database', async () => {
            const reviewID = "rev_id";
            const readingListReviewUpdate = {
                score: 5,
                comment: 'Great reading list!'
            }
            dbFindByIdAndUpdate.mockImplementation(() => Promise.reject(new Error('DB problem')));
            return await request(app).put(`/api/v1/reviews/reading_lists/${reviewID}`).set('Authorization', 'Bearer token').send(readingListReviewUpdate).then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFindByIdAndUpdate).toBeCalled();
                expect(mockSession.abortTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });
        it('Should return 500 if there is a problem in updating the reading list score', async () => {
            const readingListReview = new ReadingListReview({
                reading_list_id: '1',
                user_id: '1',
                score: 5,
                comment: 'Great reading list!'
            });
            const readingListReviewUpdate = {
                score: 5,
                comment: 'Great reading list!'
            }
            const reviewID = readingListReview._id;
            dbFindByIdAndUpdate.mockImplementation(() => Promise.resolve(readingListReview));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            util_services.updateReadingListScore.mockImplementation(() => { throw new Error('Error in the update of the score'); });
            return await request(app).put(`/api/v1/reviews/reading_lists/${reviewID}`).set('Authorization', 'Bearer token').send(readingListReviewUpdate).then(response => {
                expect(response.statusCode).toBe(500);
                expect(util_services.updateReadingListScore).toHaveBeenCalled();
                expect(mockSession.abortTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });
    });

    describe('DELETE /api/v1/reviews/books/:reviewID', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            util_services.updateBookScore.mockImplementation( jest.fn(() => { }));
            mockSession = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn()
            };
            dbSession=jest.spyOn(BookReview, 'startSession');
            dbFindByIdAndDelete=jest.spyOn(BookReview, 'findByIdAndDelete');
        });
        it('Should return 200 and delete the specified review of a book if everything is ok', async () => {
            const bookReview = new BookReview({
                book_id: '1',
                user_id: '1',
                score: 5,
                title: 'Great book!',
                comment: 'I loved it!'
            });
            const reviewID = bookReview._id;
            dbFindByIdAndDelete.mockImplementation(() => Promise.resolve(bookReview));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            return await request(app).delete(`/api/v1/reviews/books/${reviewID}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(200);
                expect(dbFindByIdAndDelete).toBeCalled();
                expect(util_services.updateBookScore).toHaveBeenCalled();
                expect(mockSession.startTransaction).toHaveBeenCalled();
                expect(mockSession.commitTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });
        it('Should return 404 if the specified review of the book is not found', async () => {
            const reviewID = "rev_id";
            const bookReview = null;
            dbFindByIdAndDelete.mockImplementation(() => Promise.resolve(bookReview));
            return await request(app).delete(`/api/v1/reviews/books/${reviewID}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "Book Review not found." });
                expect(dbFindByIdAndDelete).toBeCalled();
            });
        });
        it('Should return 500 if there is a problem with the database', async () => {
            const reviewID = "rev_id";
            dbFindByIdAndDelete.mockImplementation(() => Promise.reject(new Error('DB problem')));
            return await request(app).delete(`/api/v1/reviews/books/${reviewID}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFindByIdAndDelete).toBeCalled();
            });
        });
        it('Should return 500 if there is a problem in updating the book score', async () => {
            const bookReview = new BookReview({
                book_id: '1',
                user_id: '1',
                score: 5,
                title: 'Great book!',
                comment: 'I loved it!'
            });
            const reviewID = bookReview._id;
            dbFindByIdAndDelete.mockImplementation(() => Promise.resolve(bookReview));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            util_services.updateBookScore.mockImplementation(() => { throw new Error('Error in the update of the score'); });
            return await request(app).delete(`/api/v1/reviews/books/${reviewID}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(500);
                expect(util_services.updateBookScore).toHaveBeenCalled();
                expect(mockSession.abortTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
            
        });
    });
    describe('DELETE /api/v1/reviews/reading_lists/:reviewID', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            util_services.updateReadingListScore.mockImplementation( jest.fn(() => { }));
            mockSession = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn()
            };
            dbSession=jest.spyOn(ReadingListReview, 'startSession');
            dbFindByIdAndDelete=jest.spyOn(ReadingListReview, 'findByIdAndDelete');
        });
        it('Should return 200 and delete the specified review of a reading list if everything is ok', async () => {
            const readingListReview = new ReadingListReview({
                reading_list_id: '1',
                user_id: '1',
                score: 5,
                comment: 'Great reading list!'
            });
            const reviewID = readingListReview._id;
            dbFindByIdAndDelete.mockImplementation(() => Promise.resolve(readingListReview));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            return await request(app).delete(`/api/v1/reviews/reading_lists/${reviewID}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(200);
                expect(dbFindByIdAndDelete).toBeCalled();
                expect(util_services.updateReadingListScore).toHaveBeenCalled();
                expect(mockSession.startTransaction).toHaveBeenCalled();
                expect(mockSession.commitTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });
        it('Should return 404 if the specified review of the reading list is not found', async () => {
            const reviewID = "rev_id";
            const readingListReview = null;
            dbFindByIdAndDelete.mockImplementation(() => Promise.resolve(readingListReview));
            return await request(app).delete(`/api/v1/reviews/reading_lists/${reviewID}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({ message: "Reading list review not found." });
                expect(dbFindByIdAndDelete).toBeCalled();
            });
        });
        it('Should return 500 if there is a problem with the database', async () => {
            const reviewID = "rev_id";
            dbFindByIdAndDelete.mockImplementation(() => Promise.reject(new Error('DB problem')));
            return await request(app).delete(`/api/v1/reviews/reading_lists/${reviewID}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbFindByIdAndDelete).toBeCalled();
            });
        });
        it('Should return 500 if there is a problem in updating the reading list score', async () => {
            const readingListReview = new ReadingListReview({
                reading_list_id: '1',
                user_id: '1',
                score: 5,
                comment: 'Great reading list!'
            });
            const reviewID = readingListReview._id;
            dbFindByIdAndDelete.mockImplementation(() => Promise.resolve(readingListReview));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            util_services.updateReadingListScore.mockImplementation(() => { throw new Error('Error in the update of the score'); });
            return await request(app).delete(`/api/v1/reviews/reading_lists/${reviewID}`).set('Authorization', 'Bearer token').then(response => {
                expect(response.statusCode).toBe(500);
                expect(util_services.updateReadingListScore).toHaveBeenCalled();
                expect(mockSession.abortTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
            
        });
    });
    
    describe('POST /api/v1/reviews/books', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            util_services.updateBookScore.mockImplementation( jest.fn(() => { }));
            mockSession = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn()
            };
            dbSession=jest.spyOn(BookReview, 'startSession');
            dbSave=jest.spyOn(BookReview.prototype, 'save');
            
        });
        const bookReview = {
            book_id: "1",
            user_id: "1",
            score: 5,
            title: 'Great book!',
            comment: 'I loved it!'
        };

        it('should return 201 and add a review of a book if everything is ok', async () => {
            dbSave.mockImplementation(() => Promise.resolve(true));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            return await request(app).post('/api/v1/reviews/books').set('Authorization', 'Bearer token').send(bookReview).then(response => {
                expect(response.statusCode).toBe(201);
                expect(dbSave).toBeCalled();
                expect(util_services.updateBookScore).toHaveBeenCalled(); // Verifica che la transazione inizi
                expect(mockSession.startTransaction).toHaveBeenCalled(); // Verifica che la transazione inizi
                expect(mockSession.commitTransaction).toHaveBeenCalled(); // Verifica che la transazione venga commessa
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });
        it('should return 500 if there is a problem with the database', async () => {
            dbSave.mockImplementation(() => Promise.reject(new Error('DB problem')));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            return await request(app).post('/api/v1/reviews/books').set('Authorization', 'Bearer token').send(bookReview).then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbSave).toBeCalled();
                expect(mockSession.abortTransaction).toHaveBeenCalled();
            });
        });
        it('should return 400 if the review of the book is not valid', async () => {
            const bookReview = {
                book_id: "1",
                user_id: "1",
                score: '5kjhkh',
                title: 'Great book!',
                comment: 'I loved it!'
            };
            dbSave.mockImplementation(() => Promise.reject({ name: 'ValidationError', message: 'ValidationError' }));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            return await request(app).post('/api/v1/reviews/books').set('Authorization', 'Bearer token').send(bookReview).then(response => {
                expect(response.statusCode).toBe(400);
                expect(response.text).toBe('ValidationError');
            });
        });
        it('should return 500 if there is a problem in updating the book score', async () => {
            dbSave.mockImplementation(() => Promise.resolve(true));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            util_services.updateBookScore.mockImplementation(() => { throw new Error('Error in the update'); });
            return await request(app).post('/api/v1/reviews/books').set('Authorization', 'Bearer token').send(bookReview).then(response => {
                expect(response.statusCode).toBe(500);
                expect(util_services.updateBookScore).toHaveBeenCalled();
                expect(mockSession.abortTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });
    });
    
    describe('POST /api/v1/reviews/reading_lists', () => { 
        beforeEach(() => {
            jest.clearAllMocks();
            util_services.updateReadingListScore.mockImplementation( jest.fn(() => { }));
            mockSession = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn(),
            };
            dbSession=jest.spyOn(ReadingListReview, 'startSession');
            dbSave=jest.spyOn(ReadingListReview.prototype, 'save');
            
        });
        const readingListReview = {
            reading_list_id: "1",
            user_id: "1",
            score: 5,
            comment: 'Great reading list!'
        };
        it('should return 201 and add a review of a reading list if everything is ok', async () => {
            dbSave.mockImplementation(() => Promise.resolve(true));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            return await request(app).post('/api/v1/reviews/reading_lists').set('Authorization', 'Bearer token').send(readingListReview).then(response => {
                expect(response.statusCode).toBe(201);
                expect(dbSave).toBeCalled();
                expect(util_services.updateReadingListScore).toHaveBeenCalled();
                expect(mockSession.startTransaction).toHaveBeenCalled(); // Verify that the transaction starts
                expect(mockSession.commitTransaction).toHaveBeenCalled(); // Verify that the transaction is committed
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });
        it('should return 500 if there is a problem with the database', async () => {
            dbSave.mockImplementation(() => Promise.reject(new Error('DB problem')));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            return await request(app).post('/api/v1/reviews/reading_lists').set('Authorization', 'Bearer token').send(readingListReview).then(response => {
                expect(response.statusCode).toBe(500);
                expect(dbSave).toBeCalled();
            });
        });
        it('should return 400 if the review of the reading list is not valid', async () => {
            const readingListReview = {
                reading_list_id: "1",
                user_id: "1",
                score: '5kjhkh',
                comment: 'Great reading list!'
            };
            dbSave.mockImplementation(() => Promise.reject({ name: 'ValidationError', message: 'ValidationError' }));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            return await request(app).post('/api/v1/reviews/reading_lists').set('Authorization', 'Bearer token').send(readingListReview).then(response => {
                expect(response.statusCode).toBe(400);
                expect(response.text).toBe('ValidationError');
                expect(mockSession.abortTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });
        it('should return 500 if there is a problem in updating the reading list score', async () => {
            dbSave.mockImplementation(() => Promise.resolve(true));
            dbSession.mockImplementation(() => Promise.resolve(mockSession));
            util_services.updateReadingListScore.mockImplementation(() => { throw new Error('Error in the update'); });
            return await request(app).post('/api/v1/reviews/reading_lists').set('Authorization', 'Bearer token').send(readingListReview).then(response => {
                expect(response.statusCode).toBe(500);
                expect(util_services.updateReadingListScore).toHaveBeenCalled();
                expect(mockSession.abortTransaction).toHaveBeenCalled();
                expect(mockSession.endSession).toHaveBeenCalled();
            });
        });

    });
});