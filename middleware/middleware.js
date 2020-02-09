var middlewareObj = {};
var Place = require("../models/place");
var Comment = require("../models/comment");
var Review = require("../models/review");

middlewareObj.checkPlaceOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Place.findById(req.params.id, (err, foundPlace) => {
            if (err || !foundPlace) {
                req.flash("error", "Place not found!");
                res.redirect("back");
            } else {
                if (foundPlace.user.id.equals(req.user.id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that!");
                    res.redirect("back")
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err || !foundComment) {
                req.flash("error", "Comment not found!");
                res.redirect("back");
            } else {
                if (foundComment.author.id.equals(req.user.id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that!");
                    res.redirect("back")
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
};

middlewareObj.checkReviewOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Review.findById(req.params.review_id, (err, foundReview) => {
            if (err || !foundReview) {
                res.redirect("back");
            } else {
                // does user own the review?
                if (foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = (req, res, next) => {
    if (req.isAuthenticated()) {
        Place.findById(req.params.id).populate("reviews").exec((err, foundPlace) => {
            if (err || !foundPlace) {
                req.flash("error", "Place not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundPlace.reviews
                var foundUserReview = foundPlace.reviews.some((review) => {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/places/" + foundPlace._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

module.exports = middlewareObj;