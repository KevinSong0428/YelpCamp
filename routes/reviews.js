const express = require('express');
// mergeParams option to allow routes to access the parameters (need to access IDs here) --> was prefixed outside of this file
const router = express.Router({ mergeParams: true });
const Campground = require("../models/campground");
const Review = require("../models/review");
const catchAsync = require('../utils/catchAsync');
// import middleware to validate review
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');

// review controller
const reviews = require('../controllers/reviews');

// will go through validateReview middleware and then catchAsync
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

// need campground ID and review ID to remove the review from campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;