'use strict';

import express from 'express';
import passport from 'passport';
import {signToken, generateRefreshToken} from '../auth.service';
var User = require("../../api/user/user.model");

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    var error = err || info;
    if (error) {
      return res.status(401).json(error);
    }
    if (!user) {
      return res.status(404).json({message: 'Something went wrong, please try again.'});
    }

    var token = signToken(user._id, user.role);
    console.log(token);
    if (req.body.rememberme){
      // Get additional refresh token
      var refreshtoken = generateRefreshToken(user._id);
      res.json({ token, refreshtoken });
    } else {
      res.json({ token });
    }
  })(req, res, next)
});

router.post('/token', function(req, res, next){
  if (!req.body.token){
    // TODO make a page
    res.send(401, "Invalid reset token");
  }
	User.findOne({
		passwordResetToken: req.body.token
	}, { passwordResetExpiration: 1 }, function(err, user){
    if (!user || err){
        return res.status(401).json({error: "Invalid reset token"});
    }

    if (new Date() < user.passwordResetExpiration){
      var token = signToken(user._id, user.role);
      return res.status(200).json({token: token});
    }else{
      // TODO make a page
      return res.status(401).json({error: "Password reset token expired"});
    }
  });
});

export default router;
