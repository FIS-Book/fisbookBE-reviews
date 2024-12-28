var express = require('express');
var router = express.Router();
var BookReview = require('../models/book_review');
var ReadingListReview = require('../models/reading_list_review');

/*Reviews examples
var reviews = [

  {"bookID" : 1, "userID": 1, "reviewID": 1 , "score":4.5 , "title": "Wonderfull summer book", "comment":"What a great summer book, I've loved it! Such a shame the lady on red dies at the end..." },
  {"bookID" : 1, "userID": 2, "reviewID": 2 , "score":1 , "title": "What was that?!!!", "comment":"No spoilers but this book is sooo dissapointing. A great WTF ending without any explanation and without a reason. \n Won't recomend, DO NOT READ!!!! " },  
  {"readingListID" : 1, "userID": 1, "reviewID": 3 , "score":5 , "comment":"This list is so cool, I loved it!!!! Thanks @Julia for creating it "},
  {"readingListID" : 2, "userID": 1, "reviewID": 4 , "score":4 , "comment": "It's missing my fav book, Madame Bovary, but a pretty cool classic list!"},
  {"readingListID" : 2, "userID": 2, "reviewID": 5 , "score":0.5 , "comment": "How can you call this a classic list without including TKAMB and 1984?!!! 0.5 is being too generous..."},  
  ];
*

/* GET ALL reviews.*/
{router.get('/', async function(req, res, next) {
  try{
    var book_reviews = await BookReview.find();
    var reading_list_reviews = await ReadingListReview.find();
    res.json({book_reviews,reading_list_reviews}); 
  }catch(err){
    debug("DB problem",err);
    res.sendStatus(500);
  }
})}

/* GET reviews of every book*/
router.get('/books', async function(req, res, next) {
  try{
    var books_reviews = await BookReview.find();
    //console.log(books_reviews);
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
router.get('/reading_lists', async function(req, res, next) {
  try{
    var reading_lists_reviews = await ReadingListReview.find();
    //console.log(reading_lists_reviews);
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
router.get('/books/bk/:bookID', async function(req, res, next) {
  var id = req.params.bookID;
  //console.log("Tipo e valore di id:", typeof id, id);
  try{
    var book_reviews = await BookReview.find({book_id : id});
    //console.log(book_reviews);
    if(book_reviews.length == 0){
      return res.status(404).json({ message: "No reviews found for this book." });
    }
    return res.json(book_reviews); 
  }catch(err){
    console.error("DB problem",err);
    res.sendStatus(500);
  }
});

/* GET all reviews of a specified readinglist*/
router.get('/reading_lists/rl/:readingListID', async function(req, res, next) {
  var id = req.params.readingListID;
  //console.log("Tipo e valore di id:", typeof id, id);
  try{
    var reading_list_reviews = await ReadingListReview.find({reading_list_id : id});
    //console.log(reading_list_reviews);
    if(reading_list_reviews.length == 0){
      return res.status(404).json({ message: "No reviews found for this reading list." });
    }
    return res.json(reading_list_reviews); 
  }catch(err){
    console.error("DB problem",err);
    res.sendStatus(500);
  }
});
/* GET a review of a readinglist by review ID*/
router.get('/reading_lists/rev/:reviewID', async function(req, res, next) {
  const reviewId = req.params.reviewID;
  //console.log("Tipo e valore di id:", typeof id, id);
  try{
    var reading_list_review = await ReadingListReview.findById(reviewId);
    console.log(reading_list_review);
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
router.get('/books/rev/:reviewID', async function(req, res, next) {
  const reviewId = req.params.reviewID;
  //console.log("Tipo e valore di id:", typeof reviewID, reviewId);
  try{
    var book_review = await BookReview.findById(reviewId);
    console.log(book_review);
    if(book_review == null){
      return res.status(404).json({ message: "Review not found." });
    }
    return res.json(book_review); 
  }catch(err){
    console.error("DB problem",err);
    return res.sendStatus(500);
  }
});

/* POST a review of a book*/
router.post('/books',async function(req, res,next){
  var {user_id ,book_id, score, title, comment} = req.body;
  const book_review = new BookReview({user_id,book_id,score,title,comment});
  try{
    await book_review.save();
    return res.sendStatus(201);
  }catch(err){
    if(err.name==='ValidationError'){
      return res.status(400).send(err.message);
    }
    console.error("DB problem",err);
    res.sendStatus(500);
  }
})

/* POST a review of a reading list */
router.post('/reading_lists',async function(req, res,next){
  var {user_id ,reading_list_id, score, comment} = req.body;
  const reading_list_review = new ReadingListReview({user_id,reading_list_id,score,comment});
  try{
    await reading_list_review.save();
    return res.sendStatus(201);
  }catch(err){
    if(err.name==='ValidationError'){
      return res.status(400).send(err.message);
    }
    console.error("DB problem",err);
    res.sendStatus(500);
  }
})

/*PUT a review of a book*/
router.put('/books/:reviewID', async function(req, res,next){
  const reviewID = req.params.reviewID;
  var {score, title, comment} = req.body;
  try{
    const updatedReview = await BookReview.findByIdAndUpdate(
      reviewID,
      { score, title, comment, lastUpdate: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found." });
    }else{
      return res.status(201).json(updatedReview);
    }
    
  }catch(err){
    if(err.name==='ValidationError'){
      return res.status(400).send(err.message);
    }
    console.error("DB problem",err);
    res.sendStatus(500);
  }
}); 

/*PUT a review of a reading list*/
router.put('/reading_lists/:reviewID', async function(req, res,next){
  const reviewID = req.params.reviewID;
  var {score, comment} = req.body;
  try{
    const updatedReview = await ReadingListReview.findByIdAndUpdate(
      reviewID,
      { score, comment, lastUpdate: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found." });
    }else{
      return res.status(201).json(updatedReview);
    }

  }catch(err){
    if(err.name==='ValidationError'){
      return res.status(400).send(err.message);
    }
    console.error("DB problem",err);
    res.sendStatus(500);
  }
}); 


/*DELETE a review of a reading list*/
router.delete('/reading_lists/:reviewID', async function(req, res,next){
  const reviewID = req.params.reviewID;
  try {
    const deletedList = await ReadingListReview.findByIdAndDelete(reviewID);

    if (!deletedList) {
      return res.status(404).json({ message: 'Reading list review not found.' });
    }

    return res.status(200).json({ message: 'Reading list review deleted successfully.' });
  } catch (error) {
    console.error("Error deleting reading list:", error);
    return res.status(500).json({ message: 'An error occurred while deleting the reading list.' });
  }
}); 

/*DELETE a review of a book*/
router.delete('/books/:reviewID', async function(req, res,next){
  const reviewID = req.params.reviewID;
  try {
    const deletedBook= await BookReview.findByIdAndDelete(reviewID);

    if (!deletedBook) {
      return res.status(404).json({ message: 'Book Review not found.' });
    }

    return res.status(200).json({ message: 'Book Review deleted successfully.' });
  } catch (error) {
    console.error("Error deleting Book:", error);
    return res.status(500).json({ message: 'An error occurred while deleting the Book Review.' });
  }
}); 

module.exports = router;
