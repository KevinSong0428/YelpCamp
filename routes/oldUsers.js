const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

const users = require('../controllers/users');
const user = require('../models/user');

router.get('/register', users.renderRegister)

router.post('/register', catchAsync(users.register));

router.get('/login', users.renderLogin)

// middleware to authenticate --> login is part of authenticate method
// authenticate by local strategy (user, pass), or twitter, google, etc
// option to flash and redirect upon login failure
// must keep session info when trying to login in order to redirect properly
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.login);

router.get('/logout', users.logout);

module.exports = router;