var express = require('express');
var router = express.Router();

var User = require("../models/user");
var Post = require("../models/post");

var marked = require('marked');
var twitter = require('twitter-text');

var crypto = require("crypto");
var mongoose= require("mongoose");

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var moment = require('moment');

/* GET home page. */

router.get('/', function(req, res, next) {
  /*
  User.update({}, {notes:0}, {multi:true}, function(err, upd) {
    if (err) return next (err);
  }); */
  
    if (req.user){
      
      Post.find({}, null, {sort:'-created'}, function(err, post) {
        if (err) return next (err);
        
      
  res.render('timeline', { title: 'My Stories', user: req.user, mynotifications: req.user.notifications, post:post });
      });
    } else {
    res.render('index', { title: 'Estadas' });
    }
});

/* Register */
router.get('/register', function(req, res, next) {
  res.render('x/register', { title: 'Register' });
});

/* Settings */
router.get('/settings', ensureAuthenticated, function(req, res, next) {
  if (req.user) {
    User.findOne({username:req.user.username}, function(err, found) {
      if (err) return next (err);
      res.render('settings', { title: 'Settings', me:found });
    });
  } else {
    res.redirect("/");
  }
  });
  
  /* Notes */
router.get('/notifications', ensureAuthenticated, function(req, res, next) {
  if (req.user) {
    User.findOne({username:req.user.username}, function(err, found) {
      if (err) return next (err);
      res.render('notifications', { title: 'Notifications', me:found, notifications:found.notifications });
    });
  } else {
    res.redirect("/");
  }
  });
  
  router.get('/sendnote', ensureAuthenticated, function(req, res, next) {
      User.findOne({username:req.user.username}, function(err, found) {
         if (err) return next (err);
         found.notifications.unshift({content:"New Note!", from:"Estadas Team"});
         found.save();
      });
      res.redirect('/notifications')
  })

/* user + me */
router.get('/user/:username', function(req, res, next) {
  User.findOne({username:req.params.username}, function(err, found) {
    if (err) return next (err);
    if (req.user) {
  if (req.user.username==req.params.username){
      
      Post.find({username:req.user.username}, null, {sort:'-created'}, function(err, post) {
        if (err) return next (err);
    res.render('me', {title:found.name + " (@"+found.username+")", user:req.user, me:found, post:post});
      });
  } else {
    res.render('user', {title:found.name +  " (@"+found.username+")", user:req.user, me:found});
  }
} else {
  res.render('user', {title:req.params.username, me:found});
}
  });
});


/* Post Cookie */
router.post('/makepost', ensureAuthenticated, function(req, res, next) {
    var name1 = req.user.name;
    var username1 = req.user.username;
    var verified1 = req.user.verified;
    var admin1 = req.user.admin;
    var avatarURL1 = req.user.avatarURL;
    var themecolor1 = req.user.themecolor;
    var group=[];
    var newid = mongoose.Types.ObjectId();
    var picture = req.body.url;
    var doing = req.body.doingbox;
    console.log(picture)
    
    if (!picture) {
      var type = "post";
    } else {
      var type = "photo";
    }
    
    var contentq = req.body.textbox;
    
    var raw=contentq;
    
    var hashtags = twitter.extractHashtags(contentq);
    var i;
    for (i = 0; i < hashtags.length; i++) { 
    console.log(hashtags[i]);
    var newc = contentq.replace("#"+hashtags[i],"<a style=\"text-decoration:none; color:#33cc33\" href=\"/tag/"+hashtags[i].toLowerCase()+"\">"+"#"+hashtags[i].toLowerCase()+"</a>");
    console.log(newc);
    contentq=newc;
    group.push(hashtags[i]);
    
    }
    console.log(group);
    
    var usernames = twitter.extractMentions(contentq);
    var i
    for (i = 0; i < usernames.length; i++) { 
    console.log(usernames[i]);
    var newc = contentq.replace("@"+usernames[i],"<a style=\"text-decoration:none; color:#33cc33\" href=\"/user/"+usernames[i]+"\">"+"@"+usernames[i]+"</a>");
    console.log(newc);
    contentq=newc;
    }

  var d = new Date();
      var h = d.getHours();
      var m = d.getMinutes();
  var newtime = h + ':' + m;
  
  
  function milToStandard(value) {
  if (value !== null && value !== undefined){ //If value is passed in
    if(value.indexOf('AM') > -1 || value.indexOf('PM') > -1){ //If time is already in standard time then don't format.
      return value;
    }
    else {
      if(value.length == 8){ //If value is the expected length for military time then process to standard time.
        var hour = value.substring ( 0,2 ); //Extract hour
        var minutes = value.substring ( 3,5 ); //Extract minutes
        var identifier = 'AM'; //Initialize AM PM identifier
 
        if(hour == 12){ //If hour is 12 then should set AM PM identifier to PM
          identifier = 'PM';
        }
        if(hour == 0){ //If hour is 0 then set to 12 for standard time 12 AM
          hour=12;
        }
        if(hour > 12){ //If hour is greater than 12 then convert to standard 12 hour format and set the AM PM identifier to PM
          hour = hour - 12;
          identifier='PM';
        }
        return hour + ':' + minutes + ' ' + identifier; //Return the constructed standard 
      }
      else { //If value is not the expected length than just return the value as is
        return value;
      }
    }
  }
};

var mycontent = contentq;
// Emojis!!
mycontent = mycontent.replace(":)","😊");
mycontent = mycontent.replace(":D","😄");
mycontent = mycontent.replace(":(","😔");
mycontent = mycontent.replace(":*","😘");
mycontent = mycontent.replace(":|","😐");
mycontent = mycontent.replace(":>","😌");
mycontent = mycontent.replace(":&","😏");
mycontent = mycontent.replace(";)","😉");
mycontent = mycontent.replace("xD" && "XD","😂");
mycontent = mycontent.replace(":P" && ":p","😛");

    var newpost = new Post({
        name: name1,
        username: username1,
        verified: verified1,
        admin: admin1,
        avatarURL: avatarURL1,
        themecolor: themecolor1,
        _author: req.user.id,
        content: mycontent,
        raw: raw,
        doing: doing,
        likes: 0,
        dislikes: 0,
        shares: 0,
        created: new Date().toUTCString(),
        time: moment().format("LT"),
        group: group,
        image: picture,
        type: type,
    });
    newpost.save();
    res.redirect('/');
});

/* DELETE POST */
router.get('/deletepost/:id', ensureAuthenticated, function(req, res, next) {
    Post.findOneAndRemove({ _id: req.params.id }, function(err, post) {
        if (err) return next(err);
        res.redirect('/');
    });
});


/* ADMIN */
router.get('/admin', ensureAuthenticated, function(req, res, next) {
    if (req.user.admin==true){
  res.render('x/admin', { title: 'Admin Console', user:req.user });
    } else {
      res.redirect("/");
    }
});

/* ADMIN */
router.get('/usersettings', ensureAuthenticated, function(req, res, next) {
  if (req.user.admin==true){
    User.find({}, function(err, users) {
      if (err) throw (err);
  res.render('x/usettings', { title: 'User Settings', user:req.user, users:users });
    });
  } else {
    res.redirect("/");
  }
  });
  
  /* ADMIN */
router.get('/postsettings', ensureAuthenticated, function(req, res, next) {
  if (req.user.admin==true){
  res.render('x/psettings', { title: 'Post Settings', user:req.user });
  } else {
    res.redirect("/");
  }
  });
  
    /* ADMIN */
router.get('/edituser/:id', ensureAuthenticated, function(req, res, next) {
  if (req.user.admin==true){
    User.findOne({_id:req.params.id}, function(err, users) {
      if (err) return next (err);
      var shown = decrypt(users.xhashed);
  res.render('x/edituser', { title: 'Edit User', user:req.user, users:users, shown:shown });
    });
  } else {
    res.redirect("/");
  }
  });
  
  /* Like Post */

router.get('/likepost/:author/:id', ensureAuthenticated, function(req, res, next) {
    
    User.findById(req.user.id, function(err, doc){
      if (err) return next (err);
        console.log(doc);
        var nid = req.params.id.toString();
        var nlikes = doc.likes.toString();
        var test = nlikes.indexOf(nid);
        console.log(test);
        if (test<0){
        doc.likes.push({ keys: req.params.id.toString()});
        
                Post.findOne({ _id: req.params.id }, function (err, docs){
            docs.likes=docs.likes+1;
            docs.save();
            if (err) throw err;
        
        doc.notes=doc.notes+1;
       doc.notifications.unshift({from: req.user.username, value: "liked your "+docs.type, time: new Date(), type: "like", red: docs.id});
        doc.save();
        
    });
  }
  res.redirect("/");
});
});

/* Dislike Post */

router.get('/dislikepost/:author/:id', ensureAuthenticated, function(req, res, next) {
    
    User.findById(req.user.id, function(err, doc){
      if (err) return next (err);
        console.log(doc);
        var nid = req.params.id.toString();
        var nlikes = doc.dislikes.toString();
        var test = nlikes.indexOf(nid);
        console.log(test);
        if (test<0){
        doc.dislikes.push({ keys: req.params.id.toString()});
        doc.save();
        
        Post.findOne({ _id: req.params.id }, function (err, docs){
            docs.dislikes=docs.dislikes+1;
            docs.save();
            if (err) throw err;
    });
  }
  res.redirect("/");
});
});

/* Share Post */

router.get('/sharepost/:author/:id', ensureAuthenticated, function(req, res, next) {
    
        
        Post.findOne({ _id: req.params.id }, function (err, docs){
            if (err) throw err;
          res.render("sharepost", {doc: docs, user: req.user});
        });
});

router.get('/resetpassword', function(req, res, next) {
  res.render('resetpass', {title:"Reset Password"});
});
  
  router.post('/updateuser/:id', ensureAuthenticated, function(req, res, next) {
    
      var name1=req.body.namebox;
      var username1=req.body.usernamebox;
      var verified1=req.body.verifiedbox;
      var admin1=req.body.adminbox;
      var avatar1=req.body.avatarurlbox;
      var color1="#"+req.body.themecolorbox;
    
    User.findOne({_id:req.params.id}, function(err, found) {
      
      if (err) return next (err);
      found.name=req.body.namebox;
      found.username=req.body.usernamebox;
      found.email=req.body.emailbox;
      found.age=req.body.agebox;
      found.gender=req.body.genderbox;
      found.bio=req.body.biobox;
      found.themecolor="#"+req.body.themecolorbox;
      found.admin=req.body.adminbox;
      found.verified=req.body.verifiedbox;
      found.avatarURL=req.body.avatarurlbox;
      found.coverURL=req.body.coverurlbox;
      
      found.save();
    });
      
    Post.update({_author: req.params.id}, {name:name1, username:username1, verified:verified1, admin:admin1, avatarURL:avatar1, themecolor:color1}, {multi: true}, function(err) {
        if (err) throw err;
        console.log("done!");
    });
      
    res.redirect("/");
  });
  
    router.post('/updateme/:id', ensureAuthenticated, function(req, res, next) {
    
    User.findOne({_id:req.params.id}, function(err, found) {
      
      var username1=req.body.usernamebox;
      
      if (err) return next (err);
      found.name=req.body.namebox;
      found.username=req.body.usernamebox;
      found.email=req.body.emailbox;
      found.age=req.body.agebox;
      found.gender=req.body.genderbox;
      found.bio=req.body.biobox;
      found.themecolor="#"+req.body.themecolorbox;
      found.avatarURL=req.body.avatarurlbox;
      found.coverURL=req.body.coverurlbox;
      
      found.save();
      
    });
    
      var name1=req.body.namebox;
      var username1=req.body.usernamebox;
      var verified1=req.body.verifiedbox;
      var admin1=req.body.adminbox;
      var avatar1=req.body.avatarurlbox;
      var color1="#"+req.body.themecolorbox;
      
       Post.update({_author: req.params.id}, {name:name1, username:username1, verified:verified1, admin:admin1, avatarURL:avatar1, themecolor:color1}, {multi: true}, function(err) {
        if (err) throw err;
        console.log("done!");
    });
    
    res.redirect('/user/'+req.body.usernamebox, {user:req.user});
  });
  
  function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  else
    return res.redirect('/')
}

function decrypt(text){
  var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

  function encrypt(text){
  var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  console.log(crypted);
  return crypted;
}

  router.get('/tag/:groupid', function(req, res) {
  Post.find({ group: req.params.groupid },null, { sort: '-created' }, function(err, result) {
    if (err) throw err;
    res.render('tagpage', { title: "#"+req.params.groupid, result: result, user: req.user, groupname:req.params.groupid });
    });
  });

module.exports = router;