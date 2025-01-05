var express = require('express');
var router = express.Router();
var axios = require('axios');
var BookReview = require('../models/book_review');
var ReadingListReview = require('../models/reading_list_review');
var {getUserInfo, getBookTitle, getReadingListTitle, updateBookScore, updateReadingListScore} = require('../services/util_services');

const authenticateAndAuthorize = require('../authentication/authenticateAndAuthorize');
console.log(authenticateAndAuthorize);
require('dotenv').config();


router.get('/healthz', (req, res) => {
  res.sendStatus(200);
});

const BASE_URL = process.env.BASE_URL;

/* GET ALL reviews.*/
/*
router.get('/', async function(req, res, next) {
  try{
    let book_reviews = await BookReview.find();
    let reading_list_reviews = await ReadingListReview.find();
    res.json({book_reviews,reading_list_reviews}); 
  }catch(err){
    debug("DB problem",err);
    res.sendStatus(500);
  }
});
*/
/* GET reviews of every book*/
/*
router.get('/books', async function(req, res, next) {
  try{
    let books_reviews = await BookReview.find();
    if(books_reviews.length == 0){
      return res.status(404).json({ message: "No reviews of books found." });
    }
    return res.json(books_reviews); 
  }catch(err){
    console.error("DB problem",err);
    return res.sendStatus(500);
  }
});

/* GET reviews of every reading list*/
/*
router.get('/reading_lists', async function(req, res, next) {
  try{
    let reading_lists_reviews = await ReadingListReview.find();
    if(reading_lists_reviews.length == 0){
      return res.status(404).json({ message: "No reviews of reading lists found." });
    }
    return res.json(reading_lists_reviews); 
  }catch(err){
    console.error("DB problem",err);
    res.sendStatus(500);
  }
});
*/

/* GET all reviews of a specified book*/
router.get('/books/bk/:bookID',  authenticateAndAuthorize(['User', 'Admin']), async function(req, res, next) {
  let id = req.params.bookID;
  const token = req.headers.authorization.split(' ')[1];
  try{
    let book_reviews = await BookReview.find({book_id : id});
    console.log('book_reviews:', book_reviews);
    if(book_reviews.length == 0){
      return res.status(404).json({ message: "No reviews found for this book." });
    }
    const reviewsWithUserInfo = await Promise.all(book_reviews.map(async (review) => {
      console.log('Dati utente:', await getUserInfo());
      const user = await getUserInfo(review.user_id, token);
      console.log('Dati utente:', user);
      console.log('Dati utente 2:', { ...review._doc, user });
      return { ...review._doc, user };
    }));
    //console.log('Dati utente 3:', res.json(reviewsWithUserInfo));
    console.log('Dati utente 3:', reviewsWithUserInfo);
    return res.json(reviewsWithUserInfo);
  }catch(err){
    console.error("DB problem",err);
    res.sendStatus(500);
  }
});

/* GET all reviews of a specified readinglist*/
router.get('/reading_lists/rl/:readingListID', authenticateAndAuthorize(['User', 'Admin']), async function(req, res, next) {
  let id = req.params.readingListID;
  const token = req.headers.authorization.split(' ')[1];
  try{
    let reading_list_reviews = await ReadingListReview.find({reading_list_id : id});
    if(reading_list_reviews.length == 0){
      return res.status(404).json({ message: "No reviews found for this reading list." });
    }
    const listreviewsWithUserInfo = await Promise.all(reading_list_reviews.map(async (review) => {
      const user = await getUserInfo(review.user_id, token);
      return { ...review._doc, user };
    }));

    return res.json(listreviewsWithUserInfo);
  }catch(err){
    console.error("DB problem",err);
    res.sendStatus(500);
  }
});

/* GET a review of a readinglist by review ID*/
router.get('/reading_lists/rev/:reviewID', authenticateAndAuthorize(['User', 'Admin']), async function(req, res, next) {
  const reviewId = req.params.reviewID;
  try{
    var reading_list_review = await ReadingListReview.findById(reviewId);
    if(reading_list_review == null){
      return res.status(404).json({ message: "Review not found." });
    }
    return res.json(reading_list_review._doc); 
  }catch(err){
    console.error("DB problem",err);
    return res.sendStatus(500);
  }
});

/* GET a review of a book by review ID*/
router.get('/books/rev/:reviewID', authenticateAndAuthorize(['User', 'Admin']), async function(req, res, next) {
  const reviewId = req.params.reviewID;
  try{
    var book_review = await BookReview.findById(reviewId);;
    if(book_review == null){
      return res.status(404).json({ message: "Review not found." });
    }
    return res.json(book_review._doc); 
  }catch(err){
    console.error("DB problem",err);
    return res.sendStatus(500);
  }
});

/* GET all reviews of book made by a specific user*/
router.get('/users/:userID/bk', authenticateAndAuthorize(['User', 'Admin']), async function(req, res, next) {
  let id = req.params.userID;
  const token = req.headers.authorization.split(' ')[1];
  try{
    let book_reviews = await BookReview.find({user_id : id});
    if(book_reviews.length == 0){
      return res.status(404).json({ message: "No book reviews found for this user." });
    }
    const reviewsWithBookTitle = await Promise.all(book_reviews.map(async (review) => {
      const bookTitle = await getBookTitle(review.book_id, token);
      return { ...review._doc, bookTitle };
    }));

    return res.json(reviewsWithBookTitle);
  }catch(err){
    console.error("DB problem",err);
    res.sendStatus(500);
  }
});

/* GET all reviews of reading lists made by a specific user*/
router.get('/users/:userID/rl',  authenticateAndAuthorize(['User', 'Admin']), async function(req, res, next) {
  let id = req.params.userID;
  const token = req.headers.authorization.split(' ')[1];
  try{
    let reading_reviews = await ReadingListReview.find({user_id : id});
    if(reading_reviews.length == 0){
      return res.status(404).json({ message: "No reading list reviews found for this user." });
    }
    const reviewsWithReadingTitle = await Promise.all(reading_reviews.map(async (review) => {
      const readingTitle = await getReadingListTitle(review.reading_list_id, token);
      return { ...review._doc, readingTitle };
    }));

    return res.json(reviewsWithReadingTitle); 
  }catch(err){
    console.error("DB problem",err);
    res.sendStatus(500);
  }
});

/* POST a review of a book*/
router.post('/books', authenticateAndAuthorize(['User', 'Admin']),async function(req, res,next){
  let {user_id ,book_id, score, title, comment} = req.body;
  const book_review = new BookReview({user_id,book_id,score,title,comment});
  const token = req.headers.authorization.split(' ')[1];
  // Session to ensure consistency between the review and the book score
  const session = await BookReview.startSession();
  session.startTransaction();

  try {
    await book_review.save({ session }); //Saves the review in the session
    try {
      await updateBookScore(book_id, token, score, 'post'); // Update the book score
    } catch (error) {
      //The book score was not updated, we abort the transaction (we don't save the review)
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: 'An error occurred while updating the book score. Please try again later' });
    }

    //Everything went well, we commit the transaction
    await session.commitTransaction();
    session.endSession();
    return res.sendStatus(201);

  } catch (err) {
    await session.abortTransaction(); // Abort in case of failure
    session.endSession();
    if (err.name === 'ValidationError') {
      return res.status(400).send(err.message);
    }
    console.error("DB problem", err);
    return res.sendStatus(500);
  }
})

/* POST a review of a reading list */
router.post('/reading_lists',  authenticateAndAuthorize(['User', 'Admin']), async function(req, res,next){
  let {user_id ,reading_list_id, score, comment} = req.body;
  const reading_list_review = new ReadingListReview({user_id,reading_list_id,score,comment});
  const token = req.headers.authorization.split(' ')[1];
  // Start a session for the transaction
  const session = await ReadingListReview.startSession();
  session.startTransaction();
  try {
    // Save the reading list review within the transaction
    console.log('Here:' );
    await reading_list_review.save({ session });
    console.log('Here0:' );
    try {
      console.log('Here1:');
      await updateReadingListScore(reading_list_id, token, score,'post'); // Update the reading list score
      console.log('here2 :');
    } catch (error) {
      //The reading list score was not updated, we abort the transaction (we don't save the review)
      await session.abortTransaction();
      session.endSession();
      console.log('here3 :');
      return res.status(500).json({ message: 'An error occurred while updating the reading list score. Please try again later' });
    }

    //Everything went well, we commit the transaction
    await session.commitTransaction();
    session.endSession();
    return res.sendStatus(201);
  } catch (err) {
    console.log('here4 :');
    await session.abortTransaction(); // Abort in case of failure
    session.endSession();
    if (err.name === 'ValidationError') {
      return res.status(400).send(err.message);
    }
    console.error("DB problem", err);
    console.log('here5 :');
    return res.sendStatus(500);
  }
});

/*PUT a review of a book*/
router.put('/books/:reviewID', authenticateAndAuthorize(['User', 'Admin']), async function(req, res,next){
  const reviewID = req.params.reviewID;
  var {score, title, comment} = req.body;
  const token = req.headers.authorization.split(' ')[1];
  // Start a session for the transaction
  const session = await BookReview.startSession();
  session.startTransaction();

  try{
    const updatedReview = await BookReview.findByIdAndUpdate(
      reviewID,
      { score, title, comment, lastUpdate: Date.now() },
      { new: true, runValidators: true, session }
    );

    if (!updatedReview) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Review not found." });
    }

    try {
      // Now we update the book score
      await updateBookScore(updatedReview.book_id, token, score, 'put');
    } catch (error) {// Abort in case of failure updating the book score
      await session.abortTransaction(); 
      session.endSession();
      return res.status(500).json({ message: "An error occurred while updating the book score." });
    }

    // If everything went well, we commit the transaction
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json(updatedReview);
    
  } catch (err) {
    // In case something fails, we abort the transaction
    await session.abortTransaction();
    session.endSession();
    if (err.name === 'ValidationError') {
      return res.status(400).send(err.message);
    }
    console.error("DB problem", err);
    return res.sendStatus(500);
  }
}); 

/*PUT a review of a reading list*/
router.put('/reading_lists/:reviewID', authenticateAndAuthorize(['User', 'Admin']), async function(req, res,next){
  const reviewID = req.params.reviewID;
  var {score, comment} = req.body;
  const token = req.headers.authorization.split(' ')[1];
  // Start a session for the transaction
  const session = await ReadingListReview.startSession();
  session.startTransaction();

  try{
    const updatedReview = await ReadingListReview.findByIdAndUpdate(
      reviewID,
      { score, comment, lastUpdate: Date.now() },
      { new: true, runValidators: true , session}
    );
    if (!updatedReview) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Review not found." });
    }

    try {
      // Now we update the reading list score
      await updateReadingListScore(updatedReview.reading_list_id, token, score, 'put');
    } catch (error) {// Abort in case of failure updating the reading list score
      await session.abortTransaction(); 
      session.endSession();
      return res.status(500).json({ message: "An error occurred while updating the reading list score." });
    }

    // If everything went well, we commit the transaction
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json(updatedReview);

  }catch(err){
    // In case something fails, we abort the transaction
    await session.abortTransaction();
    session.endSession();
    if(err.name === 'ValidationError') {
      return res.status(400).send(err.message);
    }
    console.error("DB problem", err);
    return res.sendStatus(500);
  }
}); 


/*DELETE a review of a reading list*/
router.delete('/reading_lists/:reviewID', authenticateAndAuthorize(['User', 'Admin']), async function(req, res,next){
  const reviewID = req.params.reviewID;
  const token = req.headers.authorization.split(' ')[1];

  const session = await ReadingListReview.startSession();
  session.startTransaction();

  try {
    const deletedList = await ReadingListReview.findByIdAndDelete(reviewID);

    if (!deletedList) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Reading list review not found.' });
    }

    try {
      await updateReadingListScore(deletedList.reading_list_id, token, deletedList.score, 'delete');
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: 'An error occurred while updating the reading list score.' });
    }

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ message: 'Reading list review deleted successfully.' });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting reading list review:", error);
    return res.status(500).json({ message: 'An error occurred while deleting the reading list.' });
  }
}); 

/*DELETE a review of a book*/
router.delete('/books/:reviewID', authenticateAndAuthorize(['User', 'Admin']), async function(req, res,next){
  const reviewID = req.params.reviewID;
  const token = req.headers.authorization.split(' ')[1];

  const session = await BookReview.startSession();
  session.startTransaction();

  try {
    const deletedBook= await BookReview.findByIdAndDelete(reviewID);

    if (!deletedBook) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Book Review not found.' });
    }

    try {
      await updateBookScore(deletedBook.book_id, token, deletedBook.score, 'delete');
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: 'An error occurred while updating the book score.' });
    }

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ message: 'Book Review deleted successfully.' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting Book:", error);
    return res.status(500).json({ message: 'An error occurred while deleting the Book Review.' });
  }
}); 

module.exports = {
  router,  // Esporta il router
  getUserInfo  // Esporta anche le funzioni
};