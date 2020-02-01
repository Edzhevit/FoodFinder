var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.get("/", (req, res) => {
    res.render("landing");
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    var user = new User({username: req.body.username})
    var password = req.body.password;
    User.register(user, password, (err, newUser) => {
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect("/restaurants")
        });
    });
});

router.get("/login", (req, res) => {
    res.render("login");
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
    res.redirect("/restaurants");
});

function isLoggedIn (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect("/login");
}

module.exports = router;