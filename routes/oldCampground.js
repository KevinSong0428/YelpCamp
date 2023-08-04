const express = require('express');
const router = express.Router();
// .. to go up one folder and go into utils and models folder
const catchAsync = require('../utils/catchAsync');
// exporting middleware
const { isLoggedIn, validateCampground, isCampgroundAuthor } = require('../middleware');

// MVC - models. views. controllers.
// models for application
// views for template
// controllers for code in routes

// export controller - campground object with lots of methods on it
const campgrounds = require('../controllers/campgrounds');
// from now on, every route uses the controller and accesses its method for the logic

router.get('/', catchAsync(campgrounds.index))

// BEFORE ID ROUTE else 'new' will be taken as an ID
// pass in middleware to ensure loggedIn
router.get('/new', isLoggedIn, campgrounds.renderNewForm);


// RUN ISLOGGEDIN FIRST THEN VALIDATOR, AND THEN CATCHASYNC
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

router.get('/:id', catchAsync(campgrounds.showCampground))

// user needs to own campground in order to access edit page!
router.get('/:id/edit', isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.renderEditForm))

router.put('/:id', isLoggedIn, isCampgroundAuthor, validateCampground, catchAsync(campgrounds.updateCampground))

router.delete('/:id', isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;