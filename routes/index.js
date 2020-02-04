var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Restaurant = require("../models/restaurant");

router.get("/", (req, res) => {
    res.render("landing");
});

router.get("/register", (req, res) => {
    res.render("register", {page: "register"});
});

router.post("/register", (req, res) => {
    var user = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar
        });
    var password = req.body.password;
    if (req.body.adminCode === "secretcode123"){
        user.isAdmin = true;
    }
    User.register(user, password, (err, newUser) => {
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "Successfully Signed Up! Welcome to FoodFinder " + newUser.username);
            res.redirect("/restaurants")
        });
    });
});

router.get("/login", (req, res) => {
    res.render("login", {page: "login"});
});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/restaurants",
        failureRedirect: "/login"
    }), 
        (req, res) => {
    
});

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged You Out!");
    res.redirect("/restaurants");
});

router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err){
            req.flash("error", "There is no such user!");
            res.redirect("back");
        }
        Restaurant.find().where("user.id").equals(foundUser.id).exec((err, restaurants) => {
            if (err){
                req.flash("error", "There is no such user!");
                res.redirect("back");
            }
            res.render("users/show", {user: foundUser, restaurants: restaurants});
        });

    });
});

module.exports = router;