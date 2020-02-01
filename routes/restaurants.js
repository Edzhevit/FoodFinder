var express = require("express");
var router = express.Router();
var Restaurant = require("../models/restaurant");

router.get("/", (req, res) => {
    // Get all restaurants from DB
    Restaurant.find({}, (err, allRestaurants) => {
        if(err){
            console.log(err);
        } else{
            res.render("restaurants/index",
                { 
                    restaurants: allRestaurants,
                });
        }
    });
});

router.post("/", isLoggedIn, (req, res) => {
    // get data from form and add to restaurants array
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var user = {
        id: req.user.id,
        username: req.user.username
    };
    var newRestaurant = { name: name, image: image, description: description, user: user };
    // create a new restaurant and save it to DB
    Restaurant.create(newRestaurant, (err, newlyCreated) => {
        if(err){
            console.log(err);
        } else{
            // redirect back to restaurants
            res.redirect("/restaurants");
        }
    });
});

router.get("/new", isLoggedIn, (req, res) => {
    res.render("restaurants/new");
});

router.get("/:id", (req, res) => {
    // find restaurant with provided ID
    Restaurant.findById(req.params.id).populate("comments").exec((err, foundRestaurant) => {
        if(err){
            console.log(err)
        } else{
            // render show template with that restaurant
            res.render("restaurants/show", {restaurant: foundRestaurant});
        }
    });
  
});

function isLoggedIn (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect("/login");
}

module.exports = router;