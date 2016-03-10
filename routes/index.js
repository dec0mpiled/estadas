var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.user){
  res.render('timeline', { title: 'My Stories' });
    } else {
    res.render('index', {title: 'Estadas' })
    }
});

/* Register */
router.get('/register', function(req, res, next) {
  res.render('x/register', { title: 'Register'});
});

module.exports = router;
