const mongoose = require('mongoose');

// Schema for book reviews
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
    max: 5  // Values between 0 and 5
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
  },
  lastUpdate:{
    type: Date,
    default: Date.now
  }
},{collection: 'book_reviews'});

// Create a unique index to ensure one review per user and book
bookReviewSchema.index({ book_id: 1, user_id: 1 }, { unique: true });

const BookReview = mongoose.model('BookReview', bookReviewSchema);

module.exports = BookReview;

