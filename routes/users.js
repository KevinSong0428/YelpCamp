const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

const users = require('../controllers/users');


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    // middleware to authenticate --> login is part of authenticate method
    // authenticate by local strategy (user, pass), or twitter, google, etc
    // option to flash and redirect upon login failure
    // must keep session info when trying to login in order to redirect properly
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.login);

router.get('/logout', users.logout);

module.exports = router;