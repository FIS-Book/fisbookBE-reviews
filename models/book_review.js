const mongoose = require('mongoose');

// Definiamo lo schema per la recensione
const bookReviewSchema = new mongoose.Schema({
  book_id: {
    type: String,
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 5  // Valutazione da 0 a 5
  },
  title: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
},{collection: 'book_reviews'});

const BookReview = mongoose.model('BookReview', bookReviewSchema);

module.exports = BookReview;

