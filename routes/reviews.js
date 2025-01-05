var express = require('express');
var router = express.Router();
var axios = require('axios');
var BookReview = require('../models/book_review');
var ReadingListReview = require('../models/reading_list_review');
const authenticateAndAuthorize = require('../authentication/authenticateAndAuthorize');
require('dotenv').config();

router.get('/healthz', (req, res) => {
  // #swagger.tags = ['Healthz']
  res.sendStatus(200);
});

const BASE_URL = process.env.BASE_URL;
const USER_SERVICE_URL = BASE_URL + process.env.MS_USERS_URL;
const CATALOGUE_SERVICE_URL = BASE_URL + process.env.MS_CATALOGUE_URL;
const READING_LIST_SERVICE_URL = BASE_URL + process.env.MS_READING_LIST_URL;

const axiosInstance = axios.create({
  timeout: 5000 // Timeout de 5 segundos
});
// Auxiliar functions 
async function getUserInfo(userID, token) {
  // #swagger.ignore = true
  try {
    const response = await axiosInstance.get(`${USER_SERVICE_URL}/users/${userID}`, {
      // #swagger.ignore = true
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (err) {
    console.error(`Error fetching user info for userID ${userID}`, err);
    return null;
  }
}

async function getBookTitle(ISBN,token) {
  // #swagger.ignore = true
  try {
    const response = await axiosInstance.get(`${CATALOGUE_SERVICE_URL}/isbn/${ISBN}`, {
      // #swagger.ignore = true
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.title;
  } catch (err) {
    console.error(`Error fetching book info for book with ISBN: ${ISBN}`, err);
    return null;
  }
}

async function getReadingListTitle(genreID,token){
  // #swagger.ignore = true
  try {
    const response = await axiosInstance.get(`${READING_LIST_SERVICE_URL}/genres?genreId=${genreID}`, {
      // #swagger.ignore = true
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.title;
  } catch (err) {
    console.error(`Error fetching reading list info for reading list with ID: ${genreID}`, err);
    return null;
  }
}

async function updateBookScore(ISBN,token,score,method) {
  // #swagger.ignore = true
  try {
    let book = await axiosInstance.get(`${CATALOGUE_SERVICE_URL}/ISBN/${ISBN}`, {
      // #swagger.ignore = true
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    let new_nreviews;
    let new_score;
    if(method == 'post'){
      let old_nreviews = book.data.totalReviews;
      let old_score = book.data.totalRating;
      new_nreviews = old_nreviews + 1;
      new_score = (old_score * old_nreviews + score) / new_nreviews;
    }else if(method == 'put'){
      let old_score = book.data.totalRating;
      new_nreviews = book.data.totalReviews;
      let diff = score - old_score;
      new_score = (old_score * old_nreviews + diff) / new_nreviews;
    }else if (method == 'delete'){
      let old_nreviews = book.data.totalReviews;
      let old_score = book.data.totalRating;
      new_nreviews = old_nreviews - 1;
      new_score = (old_score * old_nreviews - score) / new_nreviews;
    }else{
      console.error("Method not supported");
      return null
    }
    
    try {
      const response = await axiosInstance.patch(`${CATALOGUE_SERVICE_URL}/${ISBN}/review`, {
        // #swagger.ignore = true
        "totalRating": new_score,
        "totalReviews": new_nreviews
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.title;
    } catch (err) {
      console.error(`Error updating book info for book with ISBN: ${ISBN}`, err);
      return null;
    }
  } catch (err) {
    console.error(`Error fetching book info for book with ISBN: ${ISBN}`, err);
    return null;
  }
}


async function updateReadingListScore(genreID,token,score,method) {
  // #swagger.ignore = true
  try {
    let readingList = await axiosInstance.get(`${READING_LIST_SERVICE_URL}/genres?genreId=${genreID}`, {
      // #swagger.ignore = true
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    let new_nreviews;
    let new_score;
    let old_nreviews = readingList.data.totalReviews;
    let old_score = readingList.data.totalRating;
    if(method == 'post'){
      new_nreviews = old_nreviews + 1;
      new_score = (old_score * old_nreviews + score) / new_nreviews;
    }else if(method == 'put'){
      let diff = score - old_score;
      new_score = (old_score * old_nreviews + diff) / new_nreviews;
    }else if (method == 'delete'){
      new_nreviews = old_nreviews - 1;
      new_score = (old_score * old_nreviews - score) / new_nreviews;
    }else{
      console.error("Method not supported");
      return null
    }
    try {
      const response = await axiosInstance.get(`${READING_LIST_SERVICE_URL}/readings/update-genre`, {
        // #swagger.ignore = true
        "genreId": genreID,
        "score": new_score,
        "numberReviews": new_nreviews
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.title;
    } catch (err) {
      console.error(`Error updating reading list score for reading list: ${genreID}`, err);
      return null;
    }
  } catch (err) {
    console.error(`Error fetching reading list info for reading list with ID: ${genreID}`, err);
    return null;
  }
}

/* GET ALL reviews.*/
router.get('/', authenticateAndAuthorize(['Admin']), async function(req, res, next) {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = "Get all the reviews"
    #swagger.description = "Get all the reviews of books and reading lists"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
  try{
    let book_reviews = await BookReview.find();
    let reading_list_reviews = await ReadingListReview.find();
    res.json({book_reviews,reading_list_reviews}); 
  }catch(err){
    debug("DB problem",err);
    res.sendStatus(500);
  }
});

/* GET reviews of every book*/
router.get('/books',authenticateAndAuthorize(['Admin']), async function(req, res, next) {
   /*
    #swagger.tags = ['Admin']
    #swagger.summary = "Get all the reviews of every book"
    #swagger.description = "Get all the reviews of books"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
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
router.get('/reading_lists',authenticateAndAuthorize(['Admin']), async function(req, res, next) {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = "Get all the reviews of every reading list"
    #swagger.description = "Get all the reviews of every reading list"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
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

/* GET all reviews of a specified book*/
router.get('/books/bk/:bookID',  authenticateAndAuthorize(['User', 'Admin']), async function(req, res, next) {
  /*
    #swagger.tags = ['User']
    #swagger.summary = "Get all the reviews of a specified book"
    #swagger.description = "Get all the reviews of a specified book given its ID"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
  db.book_reviews.getIndexes()
  let id = req.params.bookID;
  const token = req.headers.authorization.split(' ')[1];
  try{
    let book_reviews = await BookReview.find({book_id : id});
    if(book_reviews.length == 0){
      return res.status(404).json({ message: "No reviews found for this book." });
    }
    const reviewsWithUserInfo = await Promise.all(book_reviews.map(async (review) => {
      const user = await getUserInfo(review.user_id,token);
      return { ...review._doc, user };
    }));

    return res.json(reviewsWithUserInfo);
  }catch(err){
    console.error("DB problem",err);
    res.sendStatus(500);
  }
});

/* GET all reviews of a specified readinglist*/
router.get('/reading_lists/rl/:readingListID', authenticateAndAuthorize(['User', 'Admin']), async function(req, res, next) {
  /*
    #swagger.tags = ['User']
    #swagger.summary = "Get all the reviews of a specified reading list"
    #swagger.description = "Get all the reviews of a specified reading list given its ID"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
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
  /*
    #swagger.tags = ['User']
    #swagger.summary = "Get a review of reading list"
    #swagger.description = "Get a review of reading list given its ID"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
  const reviewId = req.params.reviewID;
  try{
    var reading_list_review = await ReadingListReview.findById(reviewId);
    if(reading_list_review == null){
      return res.status(404).json({ message: "Review not found." });
    }
    return res.json(reading_list_review); 
  }catch(err){
    console.error("DB problem",err);
    return res.sendStatus(500);
  }
});

/* GET a review of a book by review ID*/
router.get('/books/rev/:reviewID', authenticateAndAuthorize(['User', 'Admin']), async function(req, res, next) {
  /*
    #swagger.tags = ['User']
    #swagger.summary = "Get a review of books"
    #swagger.description = "Get a review of books given its ID"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
  const reviewId = req.params.reviewID;
  try{
    var book_review = await BookReview.findById(reviewId);;
    if(book_review == null){
      return res.status(404).json({ message: "Review not found." });
    }
    return res.json(book_review); 
  }catch(err){
    console.error("DB problem",err);
    return res.sendStatus(500);
  }
});

/* GET all reviews of book made by a specific user*/
router.get('/users/:userID/bk', authenticateAndAuthorize(['User', 'Admin']), async function(req, res, next) {
  /*
    #swagger.tags = ['User']
    #swagger.summary = "Get all the reviews of books made by a specific user"
    #swagger.description = "Get all the reviews of books made by a specific user given their ID"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
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
   /*
    #swagger.tags = ['User']
    #swagger.summary = "Get all the reviews of reading lists made by a specific user"
    #swagger.description = "Get all the reviews of reading lists made by a specific user given their ID"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
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
   /*
    #swagger.tags = ['User']
    #swagger.summary = "Post a new review of a book"
    #swagger.description = "Post a new review of a book indicating your userID, the bookID, score, title and comment"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
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
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already posted a review for this book.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).send(err.message);
    }
    console.error("DB problem", err);
    return res.sendStatus(500);
  }
})

/* POST a review of a reading list */
router.post('/reading_lists',  authenticateAndAuthorize(['User', 'Admin']), async function(req, res,next){
  /*
    #swagger.tags = ['User']
    #swagger.summary = "Post a new review of a reading list"
    #swagger.description = "Post a new review of a reading list indicating your user_id, the reading_list_id, score and comment"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
  let {user_id ,reading_list_id, score, comment} = req.body;
  const reading_list_review = new ReadingListReview({user_id,reading_list_id,score,comment});
  // Start a session for the transaction
  const session = await ReadingListReview.startSession();
  session.startTransaction();
  try {
    // Save the reading list review within the transaction
    await reading_list_review.save({ session });
    try {
      await updateReadingListScore(reading_list_id, token, score,'post'); // Update the reading list score
    } catch (error) {
      //The reading list score was not updated, we abort the transaction (we don't save the review)
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: 'An error occurred while updating the reading list score. Please try again later' });
    }

    //Everything went well, we commit the transaction
    await session.commitTransaction();
    session.endSession();
    return res.sendStatus(201);
  } catch (err) {
    await session.abortTransaction(); // Abort in case of failure
    session.endSession();
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already posted a review for this reading list.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).send(err.message);
    }
    console.error("DB problem", err);
    return res.sendStatus(500);
  }
})

/*PUT a review of a book*/
router.put('/books/:reviewID', authenticateAndAuthorize(['User', 'Admin']), async function(req, res,next){
  /*
    #swagger.tags = ['User']
    #swagger.summary = "Edit a review of a book"
    #swagger.description = "Edit a review(by its ID) of a book indicating the new score, title and comment"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
  const reviewID = req.params.reviewID;
  var {score, title, comment} = req.body;

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
  /*
    #swagger.tags = ['User']
    #swagger.summary = "Edit a review of a reading list"
    #swagger.description = "Edit a review(by its ID) of a reading list indicating the new score and comment"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
  const reviewID = req.params.reviewID;
  var {score, comment} = req.body;
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
  /*
    #swagger.tags = ['User']
    #swagger.summary = "Delete a review of a reading list"
    #swagger.description = "Delete a review(by its ID) of a reading list"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
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
  /*
    #swagger.tags = ['User']
    #swagger.summary = "Delete a review of a book"
    #swagger.description = "Delete a review(by its ID) of a book"
    #swagger.security = [{
        "bearerAuth": []
      }]
  */
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

module.exports = router;
