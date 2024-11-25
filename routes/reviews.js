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
    console.log(book_reviews);
    console.log(reading_list_reviews);
  
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
    console.log(books_reviews);
    if(books_reviews.length == 0){
      res.status(404).json({ message: "No reviews of books found." });
    }
    res.json(books_reviews); 
  }catch(err){
    console.error("DB problem",err);
    res.sendStatus(500);
  }
});

/* GET reviews of every reading list*/
router.get('/reading_lists', async function(req, res, next) {
  try{
    var reading_lists_reviews = await ReadingListReview.find();
    console.log(reading_lists_reviews);
    if(reading_lists_reviews.length == 0){
      res.status(404).json({ message: "No reviews of reading lists found." });
    }
    res.json(reading_lists_reviews); 
  }catch(err){
    console.error("DB problem",err);
    res.sendStatus(500);
  }
});



/* GET all reviews of a book*/
router.get('/books/:bookID', async function(req, res, next) {
  var id = req.params.bookID;
  //console.log("Tipo e valore di id:", typeof id, id);
  try{
    var book_reviews = await BookReview.find({book_id : id});
    console.log(book_reviews);
    if(book_reviews.length == 0){
      res.status(404).json({ message: "No reviews found for this book." });
    }
    res.json(book_reviews); 
  }catch(err){
    console.error("DB problem",err);
    res.sendStatus(500);
  }
});

/* GET all reviews of a readinglist*/
router.get('/reading_lists/:readingListID', async function(req, res, next) {
  var id = req.params.readingListID;
  //console.log("Tipo e valore di id:", typeof id, id);
  try{
    var reading_list_reviews = await ReadingListReview.find({reading_list_id : id});
    console.log(reading_list_reviews);
    if(reading_list_reviews.length == 0){
      res.status(404).json({ message: "No reviews found for this reading list." });
    }
    res.json(reading_list_reviews); 
  }catch(err){
    console.error("DB problem",err);
    res.sendStatus(500);
  }
});


/* GET 1 review by reviewID   */
router.get('/:reviewID', (req, res) => {
  const reviewID = parseInt(req.params.reviewID);
  const review = reviews.find(review => review.reviewID === reviewID);
  if (review) {
    res.json(review);
  } else {
    res.status(404).json({ message: "Review not found." });
  }
});

/*POST review*/
router.post('/', function(req, res, next) {
  var review = req.body;
  reviews.push(review);
  res.sendStatus(201);
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
    debug("DB problem",err);
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
    debug("DB problem",err);
    res.sendStatus(500);
  }
})

/*PUT review of a book*/
router.put('/books/:reviewID', async function(req, res,next){
  const reviewID = req.params.reviewID;
  var {score, title, comment} = req.body;
  try{
    const updatedReview = await BookReview.findByIdAndUpdate(
      reviewID,
      { score, title, comment },
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
    debug("DB problem",err);
    res.sendStatus(500);
  }
}); 

/*PUT review of a reading list*/
router.put('/reading_lists/:reviewID', async function(req, res,next){
  const reviewID = req.params.reviewID;
  var {score, comment} = req.body;
  try{
    const updatedReview = await ReadingListReview.findByIdAndUpdate(
      reviewID,
      { score, comment },
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
    debug("DB problem",err);
    res.sendStatus(500);
  }
}); 

/*DELETE review*/
router.delete('/:reviewID', (req, res) => {
  const reviewID = parseInt(req.params.reviewID);
  const review = reviews.find(review => review.reviewID === reviewID);
  if (review) {
    const index = reviews.indexOf(review);
    reviews.splice(index, 1);
    res.sendStatus(204);
  } else {
    res.status(404).json({ message: "Review not found." });
  }
});

module.exports = router;
