var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var Post = require('../models/post');
var router = express.Router();
var crypto = require("crypto");

  function encrypt(text){
  var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  console.log(crypted);
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

//check account
router.post('/checkaccount', function(req, res, next) {
  var username1 = req.body.usernamePass
  var email = req.body.emailPass
  
  User.findOne({username:username1}, function(err, users) {
    if (err) return next (err);
    console.log(users);
    if (users==null) {
     res.render('resetpass', {title:"Reset Password", info:"We couldn't find an account that uses that username. Please try again!"});
   } else {
     
   if (users.email==email) {
   res.render('changepass', {title:"Change Password", uname1:users.username, emailz1:users.email});  
    } else {
     res.render('resetpass', {title:"Reset Password", info:"The account requested does not use that email. Please try again."});
  }
   }
    
});
  
});


//change pass
router.post('/changepass/:u/:e', function(req, res, next) {
    
  var username1 = req.params.u;
  var email = req.params.e;
  
  console.log(username1+" "+email);
  
  if (req.body.confPass1 == req.body.confPass){
  
  User.findOne({username:username1}, function(err, users) {
    if (err) return next (err);
    var newpass = encrypt(req.body.confPass1);
    users.xhashed = newpass;
    users.save();
  });
  res.redirect("/");

} else {
  res.render('changepass', {title:"Change Password", info:"The passwords do not match!", uname1:username1, emailz1:email});
}
});


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
        info: "Username cannot be blank.",
        active: 'register'
      });
    }
    if (parseInt(req.body.age, 10)<13) {
      res.render("x/register",{info: 'You must be at least 13 to register.'});
      return;
    } else {
      
    }
    var x = req.body.email;
    var atpos = x.indexOf("@");
    var dotpos = x.lastIndexOf(".");
    if (atpos<1 || dotpos<atpos+2 || dotpos+2>=x.length) {
        res.render("x/register",{info: 'Invalid eMail Address.'});
        return;
    } else {
      var email=x;
    }
    
    if (req.body.password==req.body.cpassword) {
      
    } else {
      res.render("x/register",{info: 'Passwords do not match.'});
      return;
    }
    
  function encrypt(text){
  var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  console.log(crypted);
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

  User.register(new User({
    name: req.body.name,
    username: req.body.username,
    xhashed: encrypt(req.body.password),
    email: req.body.email,
    bio: "No Bio Provided",
    avatarURL: "/images/logo.png",
    coverURL: "http://31.media.tumblr.com/bbcc494c4f9b82c20f748a3a1a333e6a/tumblr_inline_nknfcv0XUz1tn2sk4.png",
    themecolor: "#FFF",
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
        res.redirect('/');
      });
    });
  });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    Post.find({}, null, { sort: '-created' }, function (err, posts) {
        if (err) return next(err);
    if (!user) { return res.render("index", { info: "No account matches that username and password.", active: 'login', title: 'Estadas', posts:posts }); }
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