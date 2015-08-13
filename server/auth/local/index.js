'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var User = require("../../api/user/user.model");

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return res.json(401, error);
    if (!user) return res.json(404, {message: 'Something went wrong, please try again.'});

    var token = auth.signToken(user._id, user.role);
    res.json({token: token});
  })(req, res, next)
});

router.post('/token', function(req, res, next){
  if (!req.body.token){
    // TODO make a page
    res.send(401, "Invalid reset token");
  }
	User.findOne({
		passwordResetToken: req.body.token
	}, function(err, user){
    if (!user || err){
        res.send(401, "Invalid reset token");
        return;
    }

		if (new Date() < user.passwordResetExpiration){
      var token = auth.signToken(user._id, user.role);
      res.json({token: token});
    }else{
      // TODO make a page
      res.send(401, "Password reset token expired");
    }
	});
});

module.exports = router;