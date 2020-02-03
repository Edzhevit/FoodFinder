var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.get("/", (req, res) => {
    res.render("landing");
});

router.get("/register", (req, res) => {
    res.render("register", {page: "register"});
});

router.post("/register", (req, res) => {
    var user = new User({username: req.body.username});
    var password = req.body.password;
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

module.exports = router;