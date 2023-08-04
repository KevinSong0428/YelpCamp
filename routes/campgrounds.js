const express = require('express');
const router = express.Router();
// .. to go up one folder and go into utils and models folder
const catchAsync = require('../utils/catchAsync');
// exporting middleware
const { isLoggedIn, validateCampground, isCampgroundAuthor } = require('../middleware');

// Multer to parse encoded URL in forms --> will add the file to request - req.file
const multer = require("multer");
const { storage } = require("../cloudinary"); //automatically looks for index folder
const upload = multer({ storage }) // upload destination

// MVC - models. views. controllers.
// models for application
// views for template
// controllers for code in routes

// export controller - campground object with lots of methods on it
const campgrounds = require('../controllers/campgrounds');
// from now on, every route uses the controller and accesses its method for the logic

// refactored same routes with different methods
router.route('/')
    .get(catchAsync(campgrounds.index))
    // RUN ISLOGGEDIN FIRST THEN VALIDATOR, AND THEN CATCHASYNC
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground))
// upload a single/array of file(s) NAMED "image"
// .post(upload.array("image"), (req, res) => {
//     console.log(req.body, req.files);
//     res.send(req.body);
// })

// BEFORE ID ROUTE else 'new' will be taken as an ID
// pass in middleware to ensure loggedIn
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isCampgroundAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.deleteCampground))

// user needs to own campground in order to access edit page!
router.get('/:id/edit', isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;