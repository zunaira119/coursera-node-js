// The dishRouter module
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favourite');
var authenticate = require('../authenticate');


var favoritesRouter = express.Router();
favoritesRouter.use(bodyParser.json());


favoritesRouter.route('/')

.all(authenticate.verifyUser)

.get(function(req, res, next) {
  Favorites.find({postedBy: req.user._id})
  .populate('postedBy dishes')
  .then((favorite) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(favorite);
}, (err) => next(err))
.catch((err) => next(err));
})


.post(function(req, res, next) {
  var dishId = req.body._id;
  var userId = req.user._id;


  var favoriteDishesData = {
    postedBy: userId,
    dishes: [dishId]
  };

  Favorites.findOne({ postedBy: userId }, function(err, favorite) {
    if(err) throw err;
      if(! favorite || favorite.length === 0) {
        Favorites.create(favoriteDishesData, function(err, favores) {
          if(err) throw err;
            console.log("A favorate dish has been created!");
            res.json(favores);
        });
      } else {
        if(favorite.dishes.indexOf(dishId) > -1) {
          res.json("This is allreayd in the favorite list!");
        } else {
          favorite.dishes.push(dishId);
          favorite.save(function(err, favores) {
            if(err) throw err;
              console.log("Added favorite dish!");
              res.json(favores);
          });
        }
      }
  });
})
// Delete ALL favorites after verifying the user
.delete(function(req, res, next) {
  Favorites.remove({postedBy: req.user._id}, function(err, resp) {
    if(err) throw err;
      res.json(resp);
  });
});

// Delete the individual favorites
favoritesRouter.route('/:dishId')
.delete(authenticate.verifyUser, function(req, res, next) {
  var dishId = req.params.dishId;
  Favorites.findOne({ postedBy: req.user._id, dishes: dishId }, function(err, favores) {
    if(err) throw err;
      fav.dishes.remove(dishId);
      fav.save(function(err, favores) {
        if(err) throw err;
          console.log("Removed favorite from list!");
          res.json(fav);
      });
  });
});

module.exports = favoritesRouter;