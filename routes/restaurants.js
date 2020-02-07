var express = require("express");
var router = express.Router({mergeParams: true});
var Restaurant = require("../models/restaurant");
var middleware = require("../middleware/middleware");
var multer = require("multer");
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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
    var noMatch;
    if (req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Restaurant.find({name: regex}, (err, allRestaurants) => {
            if (err) {
                console.log(err);
            } else {
                if (allRestaurants.length < 1){
                    noMatch = "No restaurants match that query, please try again."
                }
                res.render("restaurants/index",
                    {
                        restaurants: allRestaurants,
                        page: "restaurants",
                        noMatch: noMatch
                    });
            }
        });
    } else {
        // Get all restaurants from DB
        Restaurant.find({}, (err, allRestaurants) => {
            if (err) {
                console.log(err);
            } else {
                res.render("restaurants/index",
                    {
                        restaurants: allRestaurants,
                        page: "restaurants",
                        noMatch: noMatch
                    });
            }
        });
    }
});

router.post("/", middleware.isLoggedIn, upload.single("image"), (req, res) => {
    cloudinary.uploader.upload(req.file.path, (result) => {
        // add cloudinary url for the image to the restaurant object under image property
        req.body.restaurant.image = result.secure_url;
        // add user to restaurant
        req.body.restaurant.user = {
            id: req.user._id,
            username: req.user.username
        };
        Restaurant.create(req.body.restaurant, (err, newRestaurant) => {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            res.redirect('/restaurants/' + newRestaurant.id);
        });
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;