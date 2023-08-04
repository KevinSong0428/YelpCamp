// if not in production mode, aka in development mode --> use password in .env file
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require("ejs-mate");
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet"); // <-- add headers for security

// ROUTES
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// used to check if mongoose connected to database 
const db = mongoose.connection;
db.on("Error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

app.engine('ejs', ejsMate) // <-- using ejs mate engine to run or parse ejs files instead of default one
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

// middle ware
app.use(express.urlencoded({ extended: true })); // <-- to parse the request body
app.use(methodOverride('_method')); // <-- for method override
// allowing static files to be used (files that don't change when app is running)
app.use(express.static(path.join(__dirname, 'public')));
// prevent mongo injection --> prevents '$' and '.' in query keys. Can do replaceWith instead of deleting it too
app.use(mongoSanitize()); // .com/?$gt=asdf --> {} EMPTY QUERY!


// creating session token in cookie
const sessionConfig = {
    name: "session",
    secret: 'secret', // <-- needs to be changed
    resave: false,
    saveUninitialized: true,
    // options for cookie sent back
    cookie: {
        // httpOnly - flag when generating a cookie. If flag is included, cookie cannot be accessed through client side script --> cookie is protected from third party sources
        httpOnly: true,
        // secure: true,
        // expires a week later, this is in milliseconds
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dus1nxwa7/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// PASSPORT
app.use(passport.initialize());
// passport.session() middleware allows for persistant login sessions --> don't need to continuously login
app.use(passport.session()); // must be AFTER app.use(session)
passport.use(new LocalStrategy(User.authenticate())); // passport will be using the local strategy. And for this local strategy, the authentication method is located on our 'User' model -- authenticate method is part of passport mongoose package

// passport serialize vs deserialize - storing and unstoring user
passport.serializeUser(User.serializeUser()) // <-- deteremining how we store a user IN the session
passport.deserializeUser(User.deserializeUser()); // how to get a user OUT of the session


// middleware to for local variables MUST BE AFTER PASSPORT MIDDLEWARE!
// handles flash message and user info
app.use((req, res, next) => {
    // console.log(req.session);
    console.log(req.query)
    // local variables are accessible in every single EJS template
    res.locals.currentUser = req.user;
    // local variable named 'success' will have the success message if success
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// prefix campgrounds ROUTES with 'campgrounds'
app.use('/campgrounds', campgroundsRoutes);
// prefixing review routes
app.use('/campgrounds/:id/reviews', reviewsRoutes)
// prefixing userRoutes with nothing, just moved to another folder for cleaner code
app.use('/', userRoutes);


app.get('/', (req, res) => {
    // res.send("HOME PAGE")
    res.render('home')
})

// 'all' <-- for every single requests
// '*' <-- for every single route --> in this function, if not routes match, it will send an ExpressError
app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
})

app.use((err, req, res, next) => {
    // console.log(err);
    const { message = "Error", status = 500 } = err;
    // render error ejs file to load a nice error page
    res.status(status).render('error', { err })
})

app.listen(3000, () => {
    console.log("Serving on port 3000")
})
