var express = require("express");
var router = express.Router({mergeParams: true});
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");
var middleware = require("../middleware/middleware");

router.get("/new", middleware.isLoggedIn, (req, res) => {
    Restaurant.findById(req.params.id, (err, restaurant) => {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {restaurant: restaurant});
        }
    })
});

router.post("/", middleware.isLoggedIn, (req, res) => {
    Restaurant.findById(req.params.id, (err, restaurant) => {
        if (err) {
            console.log(err);
            req.redirect("/restaurants")
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    req.flash("error", "Something went wrong!");
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();

                    restaurant.comments.push(comment._id);
                    restaurant.save();
                    req.flash("success", "Successfully added a comment!");
                    res.redirect("/restaurants/" + restaurant._id);
                }
            })
        }
    })
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    Restaurant.findById(req.params.id, (err, foundRestaurant) => {
        if (err || !foundRestaurant) {
            req.flash("error", "Restaurant not found!");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err || !foundComment) {
                req.flash("error", "Comment not found!");
                res.redirect("back");
            } else {
                res.render("comments/edit",
                    {
                        restaurant_id: req.params.id,
                        comment: foundComment
                    });
            }
        });
    });
});

router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/restaurants/" + req.params.id);
        }
    });
});

router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/restaurants/" + req.params.id);
        }
    });
});

module.exports = router;