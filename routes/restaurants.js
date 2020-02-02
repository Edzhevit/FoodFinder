var express = require("express");
var router = express.Router({mergeParams: true});
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

router.get("/:id/edit", checkRestaurantOwnership, (req, res) => {
    Restaurant.findById(req.params.id, (err, foundRestaurant) => {
        res.render("restaurants/edit", {restaurant: foundRestaurant});
    });
});

router.put("/:id", checkRestaurantOwnership, (req, res) => {
    Restaurant.findOneAndUpdate(req.params.id, req.body.restaurant, (err, updatedRestaurant) => {
        if (err){
            res.redirect("/restaurants");
        } else {
            res.redirect("/restaurants/" + req.params.id);
        }
    });
});

router.delete("/:id", checkRestaurantOwnership, (req, res) => {
    Restaurant.findOneAndRemove(req.params.id, (err) => {
        if(err){
            res.redirect("/restaurants");
        } else {
            res.redirect("/restaurants");
        }
    })
});

function isLoggedIn (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function checkRestaurantOwnership(req, res, next){
    if (req.isAuthenticated()){
        Restaurant.findById(req.params.id, (err, foundRestaurant) => {
            if (err){
                res.redirect("back");
            } else {
                if (foundRestaurant.user.id.equals(req.user.id)){
                    next();
                } else {
                    res.redirect("back")
                }
            }
        });
    } else {
        res.redirect("back");
    }
}

module.exports = router;