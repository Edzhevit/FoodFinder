var express = require("express");
var router = express.Router({mergeParams: true});
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");

router.get("/new", isLoggedIn, (req, res) => {
    Restaurant.findById(req.params.id, (err, restaurant) =>{
        if(err){
            console.log(err);
        } else{
            res.render("comments/new", {restaurant: restaurant})
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
                    comment.author.username = req.user.username;
                    comment.author.id = req.user.id;
                    comment.save();

                    restaurant.comments.push(comment);
                    restaurant.save();
                    res.redirect("/restaurants/" + restaurant.id);
                }
            })
        }
    })
});

function isLoggedIn (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect("/login");
}

module.exports = router;