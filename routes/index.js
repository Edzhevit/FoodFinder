var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Restaurant = require("../models/restaurant");
var async = require("async");
var nodeMailer = require("nodemailer");
var crypto = require("crypto");

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
    if (req.body.adminCode === process.env.ADMIN_CODE){
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

// To use the forgot and reset you need to change your gmail settings so it allows less secure apps
router.get("/forgot", (req, res) => {
    res.render("forgot");
});

router.post("/forgot", (req, res, next) => {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, (err, buf) => {
                var token = buf.toString("hex");
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({email: req.body.email}, (err, foundUser) => {
                if(!foundUser){
                    req.flash("error", "No account with that email address exists!");
                    return res.redirect("/forgot");
                }
                foundUser.resetPasswordToken = token;
                foundUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                foundUser.save((err) => {
                    done(err, token, foundUser);
                });
            });
        },
        function (token, user, done) {
            var smtpTransport = nodeMailer.createTransport({
                service: "Gmail",
                auth: {
                    // You need to put your own email and password here
                    user: "test@gmail.com",
                    pass: "test"
                }
            });
            var mailOptions = {
                to: user.email,
                // You need to put your own email here
                from: "test@gmail.com",
                subject: "FoodFinder password reset",
                text: "You are receiving this email because you (or someone else) have requested reset of the password for your account." +
                      "Please click on the following link, or paste this into your browser to complete the process:" +
                      "http://" + req.headers.host + "/reset/" + token + "\n\n" +
                      "If you did not request this, please ignore this email and your password will remain unchanged."
            };
            smtpTransport.sendMail(mailOptions, (err) => {
                req.flash("success", "An email has been sent to " + user.email + " with further instructions.");
                done(err, "done");
            });
        }
    ], (err) => {
        if (err){
            return next(err);
        }
        res.redirect("forgot")
    });
});

router.get("/reset/:token", (req, res) => {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, (err, foundUser) => {
        if (!foundUser){
            req.flash("error", "Password reset token is invalid or has expired!");
            return res.redirect("/forgot");
        }
        res.render("reset", {token: req.params.token});
    });
});

router.post("/reset/:token", (req, res) => {
    async.waterfall([
        function (done) {
            User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, (err, user) => {
                if (!user){
                    req.flash("error", "Password reset token is invalid or has expired!");
                    return res.redirect("back");
                }
                if (req.body.password === req.body.confirmPassword){
                    user.setPassword(req.body.password, (err) => {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        user.save((err) => {
                            req.logiIn(user, (err) => {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect("back");
                }
            });
        },
        function (user, done) {
            var smtpTransport = nodeMailer.createTransport({
                service: "Gmail",
                auth: {
                    // You need to put your own email and password here
                    user: "test@gmail.com",
                    pass: "test"
                }
            });
            var mailOptions = {
                to: user.email,
                // You need to put your own email here
                from: "test@gmail.com",
                subject: "Your password has been changed!",
                text: "Hello,\n\n" +
                      "This is a confirmation that the password for your account " + user.email + " has just changed."
            };
            smtpTransport.sendMail(mailOptions, (err) => {
                req.flash("success", "Your password has been changed!");
                done(err);
            });
        }
    ], (err) => {
        res.redirect("/restaurants");
    });
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