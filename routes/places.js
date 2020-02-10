var express = require("express");
var router = express.Router({mergeParams: true});
var Place = require("../models/place");
var User = require("../models/user");
var Comment = require("../models/comment");
var Notification = require("../models/notification");
var Review = require("../models/review");
var middleware = require("../middleware/middleware");
var multer = require("multer");

// config multer
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};
var upload = multer({storage: storage, fileFilter: imageFilter});

// config cloudinary
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

// show all places
router.get("/", (req, res) => {
    var noMatch;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Place.find({name: regex}, (err, allPlaces) => {
            if (err) {
                console.log(err);
            } else {
                if (allPlaces.length < 1) {
                    noMatch = "No places match that query, please try again."
                }
                res.render("places/index",
                    {
                        places: allPlaces,
                        page: "places",
                        noMatch: noMatch
                    });
            }
        });
    } else {
        // Get all places from DB
        Place.find({}, (err, allPlaces) => {
            if (err) {
                console.log(err);
            } else {
                res.render("places/index",
                    {
                        places: allPlaces,
                        page: "places",
                        noMatch: noMatch
                    });
            }
        });
    }
});

// add new place to DB
router.post("/", middleware.isLoggedIn, upload.single("image"), async (req, res) => {
    cloudinary.uploader.upload(req.file.path, async (result) => {
        // add cloudinary url for the image to the place object under image property
        req.body.place.image = result.secure_url;
        // add user to place
        req.body.place.user = {
            id: req.user._id,
            username: req.user.username
        };
        try {
            var place = await Place.create(req.body.place);
            var user = await User.findById(req.user.id).populate("followers").exec();
            var newNotification = {
                username: req.user.username,
                placeId: place.slug
            };
            for (var follower of user.followers) {
                var notification = await Notification.create(newNotification);
                follower.notifications.push(notification);
                follower.save();
            }
            res.redirect("/places/" + place.slug);
        } catch (err) {
            req.flash("error", err.message);
            res.redirect("back");
        }
    });
});

// show form to create new place
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("places/new");
});

// show more info about one place
router.get("/:slug", (req, res) => {
    // find place with provided ID
    Place.findOne({slug: req.params.slug}).populate("comments").populate("likes").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec((err, foundPlace) => {
        if (err || !foundPlace) {
            req.flash("error", "Place not found!");
            res.redirect("back");
        } else {
            // render show template with that place
            res.render("places/show", {place: foundPlace});
        }
    });

});

// add or remove like
router.post("/:slug/like", middleware.isLoggedIn, (req, res) => {
    Place.findOne({slug: req.params.slug}, (err, foundPlace) => {
        if (err){
            req.flash("error", "No place with that id exists.");
            res.redirect("back");
        }
        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundPlace.likes.some((like) => {
            return like.equals(req.user.id);
        });

        if (foundUserLike){
            // user already liked, removing like
            foundPlace.likes.pull(req.user.id);
        } else {
            foundPlace.likes.push(req.user);
        }

        foundPlace.save(function (err) {
            if (err){
                req.flash("error", "Something went wrong.")
            }
            return res.redirect("/places/" + foundPlace.slug);
        })
    })
});

// show edit form for a place
router.get("/:slug/edit", middleware.checkPlaceOwnership, (req, res) => {
    Place.findOne({slug: req.params.slug}, (err, foundPlace) => {
        res.render("places/edit", {place: foundPlace});
    });
});

// update a place
router.put("/:slug", middleware.checkPlaceOwnership, (req, res) => {
    delete req.body.place.rating;
    // find and update the correct place
    Place.findOneAndUpdate({slug: req.params.slug}, req.body.place, (err, foundPlace) => {
        if (err) {
            res.redirect("/places");
        } else {
            req.flash("success", "Place edited!");
            res.redirect("/places/" + foundPlace.slug);
        }
    });
});

// delete a place
router.delete("/:slug", middleware.checkPlaceOwnership, (req, res) => {
    Place.findOne({slug: req.params.slug}, (err, foundPlace) => {
        if (err) {
            res.redirect("/places");
        } else {
            // delete all comments associated with the foundPlace
            Comment.remove({"_id": {$in: foundPlace.comments}}, (err) => {
                if (err) {
                    return res.redirect("/places");
                }
                // delete all reviews associated with the foundPlace
                Review.remove({"_id": {$in: foundPlace.reviews}}, (err) => {
                    if (err) {
                        return res.redirect("/places");
                    }
                    // delete the place
                    foundPlace.remove();
                    req.flash("success", "Place Deleted!");
                    res.redirect("/places");
                });

            });
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;