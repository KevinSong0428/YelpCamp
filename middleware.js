// creating middleware function to use in other files.
const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require("./schema");
const ExpressError = require('./utils/ExpressError');

// middleware function to check if logged in
module.exports.isLoggedIn = (req, res, next) => {
    // passport will deserialize the information and fill in req.user with the User object data that was store in the section
    // console.log("REQ.USER: ", req.user);

    // store the original url they are requesting to the session
    req.session.returnTo = req.originalUrl;
    // passport isAuthenticated method will return boolean if user is logged in or not
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in.')
        return res.redirect('/login');
    }
    // else if logged in, carry on
    next();
}

// middleware to validate campground
// checking if the data entered is valid
module.exports.validateCampground = (req, res, next) => {
    // created a Joi schema, not mongoose --> exported from schema.js
    // destructure the result and get only the error
    const { error } = campgroundSchema.validate(req.body);
    console.log(error);
    if (error) {
        // want to combine the message if there are multiple errors
        const msg = error.details.map(e => e.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// middleware to check if user is the campground author
module.exports.isCampgroundAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // check user needs to own campground in order to update!
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to access this page!');
        res.redirect('/campgrounds');
    }
    next();
}

// we don't create app.use because we don't want to run it on every single request --> middleware to validate review
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


// middleware to check if user is the review author
module.exports.isReviewAuthor = async (req, res, next) => {
    // params was called  'id', and 'reviewId'
    // one is for campground id and other is review id
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    // check user needs to own campground in order to update!
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to access this page!');
        res.redirect(`/campgrounds/${id}`);
    }
    next();
}