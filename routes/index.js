var express = require('express');
var router = express.Router();

var User = require("../models/user");
var Post = require("../models/post");

var marked = require('marked');
var twitter = require('twitter-text');

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.user){
  res.render('timeline', { title: 'My Stories', user: req.user });
    } else {
    res.render('index', { title: 'Estadas' });
    }
});

/* Register */
router.get('/register', function(req, res, next) {
  res.render('x/register', { title: 'Register' });
});

/* Settings */
router.get('/settings', function(req, res, next) {
  if (req.user) {
    User.findOne({username:req.user.username}, function(err, found) {
      if (err) return next (err);
      res.render('settings', { title: 'Settings', me:found });
    });
  } else {
    res.redirect("/");
  }
  });

/* user + me */
router.get('/user/:username', function(req, res, next) {
  User.findOne({username:req.params.username}, function(err, found) {
    if (err) return next (err);
    if (req.user) {
  if (req.user.username==req.params.username){
    res.render('me', {title:req.params.username, user:req.user, me:found});
  } else {
    res.render('user', {title:req.params.username, user:req.user, me:found});
  }
} else {
  res.render('user', {title:req.params.username, me:found});
}
  });
});

module.exports = router;
