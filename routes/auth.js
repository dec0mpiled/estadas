var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var Post = require('../models/post');
var router = express.Router();
var crypto = require("crypto");

router.get('/register', function(req, res) {
  res.render('x/register', { active: 'register', title: 'Register' });
});

router.get('/login', function(req, res) {
  res.render('x/login', { active: 'login', title: 'Login', user:req.user });
});

router.post('/register/', function(req, res, next) {
  var username=req.body.username;
   if (username=="" || username==" " || username=="  " || username=="   "){
    return res.render("x/register", {
        info: "username cannot be blank!",
        active: 'register'
      });
    }
    if (parseInt(req.body.age, 10)<13) {
      res.render("x/register",{info: 'you must be at least 13 to register!'});
      return;
    } else {
      
    }
    var x = req.body.email;
    var atpos = x.indexOf("@");
    var dotpos = x.lastIndexOf(".");
    if (atpos<1 || dotpos<atpos+2 || dotpos+2>=x.length) {
        res.render("x/register",{info: 'invalid email address!'});
        return;
    } else {
      var email=x;
    }
    
    if (req.body.password==req.body.cpassword) {
      
    } else {
      res.render("x/register",{info: 'passwords do not match!'});
      return;
    }
    
  function encrypt(text){
  var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  console.log(crypted);
  return crypted;
}

  User.register(new User({
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
    xhashed: encrypt(req.body.password),
    email: req.body.email,
    bio: "No Bio Provided",
    avatarURL: "https://lh3.googleusercontent.com/-6KlC15r4hVM/AAAAAAAAAAI/AAAAAAAAAAA/Z3rElISxGO8/photo.jpg",
    coverURL: "http://31.media.tumblr.com/bbcc494c4f9b82c20f748a3a1a333e6a/tumblr_inline_nknfcv0XUz1tn2sk4.png",
    themecolor: "#000",
    gender: "Not Specified",
    age: parseInt(req.body.age, 10),
    admin: false,
    verified: false
  }), req.body.password, function(err, account) {
    if (err) {
      return res.render("a/register", {
        info: "username already exists!",
        active: 'register'
      });
    }
    passport.authenticate('local')(req, res, function() {
      req.session.save(function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/notifications');
      });
    });
  });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    Post.find({}, null, { sort: '-created' }, function (err, posts) {
        if (err) return next(err);
    if (!user) { return res.render("index", { info: "no account exists with that username and password :/", active: 'login', title: 'ShareCookie', posts:posts }); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      var hour = 3600000;
      req.session.cookie.maxAge = 14 * 24 * hour; //2 weeks
      return res.redirect('/');
    });
    });
  })(req, res, next);
});

router.get('/logout', function(req, res, next) {
  req.logout();
  req.session.save(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// update
router.post('/update', function (req, res, next) {
  User.findOneAndUpdate({ _id: req.user.id }, {
    name: req.body.name,
    email: req.body.email,
    username: req.body.username
  }, function (err, account) {
    if (err) return next(err);
    res.redirect('/');
  });
});

module.exports = router;