const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

// User.register(object, password) --> pass in User object and the password and it will take caree of the rest, hashes password and adds salt. also stores the salt too. --> passport-local-mongoose method
// ^ do not need to save(), it automatically does it
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        // we do not store password in the User object created
        const user = new User({ email, username });
        // register method automatically saves the user
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        // passport creates a logged in session, needs a callback error function parameter
        req.login(registeredUser, err => {
            if (err) return next(err);
            // after successful register, create session logged in
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    // if authentication is success, run code
    req.flash('success', `Welcome back ${req.session.passport.user}!`);
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo; // after getting link, delete it from session
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    // passport function to logout from request
    // callback function passed into logout to handle any potential errors
    const username = req.session.passport.user
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', `Goodbye ${username}! Successfully logged out.`);
        res.redirect('/campgrounds');
    });
}