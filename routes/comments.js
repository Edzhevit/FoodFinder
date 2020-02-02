var express = require("express");
var router = express.Router({mergeParams: true});
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");

router.get("/new", isLoggedIn, (req, res) => {
    Restaurant.findById(req.params.id, (err, restaurant) =>{
        if(err){
            console.log(err);
        } else{
            res.render("comments/new", {restaurant: restaurant});
        }
    })
});

router.post("/", isLoggedIn, (req, res) => {
    Restaurant.findById(req.params.id, (err, restaurant) =>{
        if(err){
            console.log(err);
            req.redirect("/restaurants")
        } else{
            Comment.create(req.body.comment, (err, comment) => {
                if(err){
                    console.log(err);
                } else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();

                    restaurant.comments.push(comment._id);
                    restaurant.save();
                    res.redirect("/restaurants/" + restaurant._id);
                }
            })
        }
    })
});

router.get("/:comment_id/edit", checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
       if (err){
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

router.put("/:comment_id",checkCommentOwnership, (req, res) => {
    Comment.findOneAndUpdate(req.params.comment_id, req.body.comment,(err, updatedComment) => {
        if (err){
            res.redirect("back");
        } else {
            res.redirect("/restaurants/" + req.params.id);
        }
    });
});

router.delete("/:comment_id", checkCommentOwnership, (req, res) => {
    Comment.findOneAndDelete(req.params.comment_id, (err) => {
       if (err){
           res.redirect("back");
       } else {
           res.redirect("/restaurants/" + req.params.id);
       }
    });
});

function isLoggedIn (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect("/login");
}

function checkCommentOwnership(req, res, next){
    if (req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err){
                res.redirect("back");
            } else {
                if (foundComment.author.id.equals(req.user.id)){
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