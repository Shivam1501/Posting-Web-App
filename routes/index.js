var express = require('express');
var router = express.Router();
const sendmail = require('./nodemailer');
const passport = require('passport');
const usermodel = require('./users');
const postmodel = require('./post');
const multer = require('multer');
const localStrategy = require('passport-local');

const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

passport.use(new localStrategy(usermodel.authenticate()));

router.get('/', function (req, res) {
  res.render('index');
});

router.get('/reset', function (req, res) {
  res.render('email')
})

router.post('/reset', function (req, res) {
  usermodel.findOne({ email: req.body.email })
    .then(function (foundUser) {
      if (foundUser !== null) {
        const secretkey = uuidv4();
        foundUser.secret = secretkey
        foundUser.expiry = Date.now() + 5 * 60 * 1000
        foundUser.save()
          .then(function () {
            var routeraddress = `http://localhost:3000/reset/${foundUser._id}/${secretkey}`
            sendmail(req.body.email, routeraddress)
              .then(function () {
                res.send('sent!')
              })
          })
      }
      else {
        res.send('This account does not exists')
      }
    })
})

router.get('/reset/:id/:secret',function(req,res){
  usermodel.findOne({_id:req.params.id})
  .then(function(foundUser){
    if(foundUser.secret === req.params.secret && foundUser.expiry > Date.now()){
      res.render('newpassword',{foundUser})
    }
  })
})

router.post('/newpassword/:id',function(req,res){
  usermodel.findOne({_id:req.params.id})
  .then(function(foundUser){
    if(req.body.password1 === req.body.password2){
      foundUser.setPassword(req.body.password1,function(err,updated){
        foundUser.save()
        .then(function(){
          res.redirect('/')
        })
      })
    }
  })
})

router.post('/profilepic', upload.single('image'), function (req, res) {
  usermodel.findOne({ username: req.session.passport.user })
    .then(function (foundUser) {
      foundUser.profilepic.push(req.file.filename)
      foundUser.save()
        .then(function () {
          res.redirect('/profile')
        })
    })
})

router.get('/showprofilepic', isloggedIn, function (req, res) {
  usermodel.findOne({ username: req.session.passport.user })
    .then(function (foundUser) {
      res.render('show', { foundUser })
    })
})

router.get('/setpic/:index', isloggedIn, function (req, res) {
  usermodel.findOne({ username: req.session.passport.user })
    .then(function (foundUser) {
      foundUser.profilepic.push(foundUser.profilepic[req.params.index])
      foundUser.profilepic.splice(req.params.index, 1)
      foundUser.save()
        .then(function () {
          res.redirect('/profile')
        })
    })
})

router.post('/createpost', isloggedIn, function (req, res) {
  usermodel.findOne({ username: req.session.passport.user })
    .then(function (foundUser) {
      postmodel.create({
        imageurl: req.body.imageurl,
        caption: req.body.caption,
        postuser: foundUser._id
      })
        .then(function (createdPost) {
          foundUser.posts.push(createdPost);
          foundUser.save()
            .then(function () {
              res.redirect('/profile')
            })
        })
    })
});

router.get('/profile', function (req, res) {
  usermodel.findOne({ username: req.session.passport.user })
    .populate('posts')
    .then(function (loggedUser) {
      res.render('profile', { loggedUser })
    })
});

router.get('/likes/:id', isloggedIn, function (req, res) {
  usermodel.findOne({ username: req.session.passport.user })
    .then(function (foundedUser) {
      postmodel.findOne({ _id: req.params.id })
        .then(function (foundedPost) {
          if (foundedPost.likes.indexOf(foundedUser._id) === -1) {
            foundedPost.likes.push(foundedUser._id)
          }
          else {
            var index = foundedPost.likes.indexOf(foundedUser._id)
            foundedPost.likes.splice(index, 1)
          }
          foundedPost.save()
            .then(function () {
              res.redirect(req.headers.referer)
            })
        })
    })
})



router.get('/timeline', isloggedIn, function (req, res) {
  usermodel.findOne({ username: req.session.passport.user })
    .then(function (foundsUser) {
      postmodel.find()
        .populate('postuser')
        .then(function (allpost) {
          res.render('timeline', { allpost })
        })
    })
});

router.post('/register', function (req, res) {
  var newuser = new usermodel({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username
  })
  usermodel.register(newuser, req.body.password)
    .then(function () {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile')
      })
    })
    .catch(function (e) {
      res.send(e)
    })
})

router.post('/login', passport.authenticate('local', { successRedirect: '/profile', failureRedirect: '/' }), function (req, res) {

});

router.get('/logout', function (req, res) {
  req.logOut()
  res.redirect('/')
});

function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/');
  }
}


module.exports = router;
