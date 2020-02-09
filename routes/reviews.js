var express = require("express");
var router = express.Router({mergeParams: true});
var Place = require("../models/place");
var Review = require("../models/review");
var middleware = require("../middleware/middleware");

// Reviews Index
router.get("/",  (req, res) => {
    Place.findById(req.params.id).populate({
        path: "reviews",
        options: {sort: {createdAt: -1}} // sorting the populated reviews array to show the latest first
    }).exec(function (err, place) {
        if (err || !place) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", {place: place});
    });
});

// Reviews New
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, (req, res) => {
    // middleware.checkReviewExistence checks if a user already reviewed the place, only one review per user is allowed
    Place.findById(req.params.id, (err, foundPlace) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/new", {place: foundPlace});
    });
});

// Reviews Create
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, (req, res) => {
    //lookup place using ID
    Place.findById(req.params.id).populate("reviews").exec((err, foundPlace) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Review.create(req.body.review, (err, newReview) => {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            //add author username/id and associated place to the review
            newReview.author.id = req.user._id;
            newReview.author.username = req.user.username;
            newReview.place = foundPlace;
            //save review
            newReview.save();
            foundPlace.reviews.push(newReview);
            // calculate the new average review for the place
            foundPlace.rating = calculateAverage(foundPlace.reviews);
            //save place
            foundPlace.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/places/' + foundPlace._id);
        });
    });
});

// Reviews Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, (req, res) => {
    Review.findById(req.params.review_id, (err, foundReview) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/edit", {place_id: req.params.id, review: foundReview});
    });
});

// Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, (req, res) => {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, (err, updatedReview) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Place.findById(req.params.id).populate("reviews").exec((err, foundPlace) => {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate place average
            foundPlace.rating = calculateAverage(foundPlace.reviews);
            //save changes
            foundPlace.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/places/' + foundPlace._id);
        });
    });
});

// Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, (req, res) => {
    Review.findByIdAndRemove(req.params.review_id,  (err) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Place.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews")
            .exec((err, campground) => {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate place average
            place.rating = calculateAverage(place.reviews);
            //save changes
            place.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/places/" + req.params.id);
        });
    });
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;