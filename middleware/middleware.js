var middlewareObj = {};
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");

middlewareObj.checkRestaurantOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Restaurant.findById(req.params.id, (err, foundRestaurant) => {
            if (err || !foundRestaurant) {
                req.flash("error", "Restaurant not found!");
                res.redirect("back");
            } else {
                if (foundRestaurant.user.id.equals(req.user.id)) {
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
                if (foundComment.author.id.equals(req.user.id)) {
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

module.exports = middlewareObj;