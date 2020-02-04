var express = require("express");
var router = express.Router({mergeParams: true});
var Restaurant = require("../models/restaurant");
var middleware = require("../middleware/middleware");

/* Need to create payment billing profile in google maps

// var NodeGeocoder = require("node-geocoder");

// var options = {
//     provider: "google",
//     httpAdapter: "https",
//     apiKey: process.env.GEOCODER_API_KEY,
//     formatter: null
// };

// var geocoder = NodeGeocoder(options);

 */

router.get("/", (req, res) => {
    // Get all restaurants from DB
    Restaurant.find({}, (err, allRestaurants) => {
        if (err) {
            console.log(err);
        } else {
            res.render("restaurants/index",
                {
                    restaurants: allRestaurants,
                    page: "restaurants"
                });
        }
    });
});

router.post("/", middleware.isLoggedIn, (req, res) => {
    // get data from form and add to restaurants array
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var location = req.body.location;
    var user = {
        id: req.user.id,
        username: req.user.username
    };
    var newRestaurant = { name: name, image: image, description: description, user: user, location: location};
    // create a new restaurant and save it to DB
    Restaurant.create(newRestaurant, (err, newlyCreated) => {
        if(err){
            console.log(err);
            res.redirect("back");
        } else{
            // redirect back to restaurants
            req.flash("success", "Restaurant created!");
            res.redirect("/restaurants");
        }
    });
});

router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("restaurants/new");
});

router.get("/:id", (req, res) => {
    // find restaurant with provided ID
    Restaurant.findById(req.params.id).populate("comments").exec((err, foundRestaurant) => {
        if (err || !foundRestaurant) {
            req.flash("error", "Restaurant not found!");
            res.redirect("back");
        } else {
            // render show template with that restaurant
            res.render("restaurants/show", {restaurant: foundRestaurant});
        }
    });

});

router.get("/:id/edit", middleware.checkRestaurantOwnership, (req, res) => {
    Restaurant.findById(req.params.id, (err, foundRestaurant) => {
        res.render("restaurants/edit", {restaurant: foundRestaurant});
    });
});

router.put("/:id", middleware.checkRestaurantOwnership, (req, res) => {
    Restaurant.findByIdAndUpdate(req.params.id, req.body.restaurant, (err, updatedRestaurant) => {
        if (err){
            res.redirect("/restaurants");
        } else {
            req.flash("success", "Restaurant edited!");
            res.redirect("/restaurants/" + req.params.id);
        }
    });
});

router.delete("/:id", middleware.checkRestaurantOwnership, (req, res) => {
    Restaurant.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            res.redirect("/restaurants");
        } else {
            req.flash("success", "Restaurant Deleted!");
            res.redirect("/restaurants");
        }
    })
});

module.exports = router;