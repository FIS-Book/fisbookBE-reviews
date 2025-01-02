const mongoose = require('mongoose');

// Schema for reading list reviews
const readingListReviewSchema = new mongoose.Schema({
    reading_list_id: {
      type: String,
      required: true
    },
    user_id: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 5,
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
  },{ collection: 'reading_list_reviews'});
  
  const ReadingListReview = mongoose.model('ReadingListReview', readingListReviewSchema);
  module.exports = ReadingListReview;