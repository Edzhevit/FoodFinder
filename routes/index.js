var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Place = require("../models/place");
var Notification = require("../models/notification");
var middleware = require("../middleware/middleware");
var async = require("async");
var nodeMailer = require("nodemailer");
var crypto = require("crypto");

// root route
router.get("/", (req, res) => {
    res.render("landing");
});

// show registration form
router.get("/register", (req, res) => {
    res.render("register", {page: "register"});
});

// handle sign up logic
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
            req.flash("success", "Successfully Signed Up! Welcome to PlaceFinder " + newUser.username);
            res.redirect("/places")
        });
    });
});

// show login form
router.get("/login", (req, res) => {
    res.render("login", {page: "login"});
});

// handle login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/places",
        failureRedirect: "/login"
    }), 
        (req, res) => {
    
});

// logout route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged You Out!");
    res.redirect("/places");
});

// To use the forgot and reset you need to change your gmail settings so it allows less secure apps
// get forgot password form
// router.get("/forgot", (req, res) => {
//     res.render("forgot");
// });

// To use the forgot and reset you need to change your gmail settings so it allows less secure apps
// handle forgot password logic
// router.post("/forgot", (req, res, next) => {
//     async.waterfall([
//         function (done) {
//             crypto.randomBytes(20, (err, buf) => {
//                 var token = buf.toString("hex");
//                 done(err, token);
//             });
//         },
//         function (token, done) {
//             User.findOne({email: req.body.email}, (err, foundUser) => {
//                 if(!foundUser){
//                     req.flash("error", "No account with that email address exists!");
//                     return res.redirect("/forgot");
//                 }
//                 foundUser.resetPasswordToken = token;
//                 foundUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour
//
//                 foundUser.save((err) => {
//                     done(err, token, foundUser);
//                 });
//             });
//         },
//         function (token, user, done) {
//             var smtpTransport = nodeMailer.createTransport({
//                 service: "Gmail",
//                 auth: {
//                     // You need to put your own email and password here
//                     user: "test@gmail.com",
//                     pass: "test"
//                 }
//             });
//             var mailOptions = {
//                 to: user.email,
//                 // You need to put your own email here
//                 from: "test@gmail.com",
//                 subject: "PlaceFinder password reset",
//                 text: "You are receiving this email because you (or someone else) have requested reset of the password for your account." +
//                       "Please click on the following link, or paste this into your browser to complete the process:" +
//                       "http://" + req.headers.host + "/reset/" + token + "\n\n" +
//                       "If you did not request this, please ignore this email and your password will remain unchanged."
//             };
//             smtpTransport.sendMail(mailOptions, (err) => {
//                 req.flash("success", "An email has been sent to " + user.email + " with further instructions.");
//                 done(err, "done");
//             });
//         }
//     ], (err) => {
//         if (err){
//             return next(err);
//         }
//         res.redirect("forgot")
//     });
// });

// To use the forgot and reset you need to change your gmail settings so it allows less secure apps
// get reset password form
// router.get("/reset/:token", (req, res) => {
//     User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, (err, foundUser) => {
//         if (!foundUser){
//             req.flash("error", "Password reset token is invalid or has expired!");
//             return res.redirect("/forgot");
//         }
//         res.render("reset", {token: req.params.token});
//     });
// });

// To use the forgot and reset you need to change your gmail settings so it allows less secure apps
// handle reset password logic
// router.post("/reset/:token", (req, res) => {
//     async.waterfall([
//         function (done) {
//             User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, (err, user) => {
//                 if (!user){
//                     req.flash("error", "Password reset token is invalid or has expired!");
//                     return res.redirect("back");
//                 }
//                 if (req.body.password === req.body.confirmPassword){
//                     user.setPassword(req.body.password, (err) => {
//                         user.resetPasswordToken = undefined;
//                         user.resetPasswordExpires = undefined;
//                         user.save((err) => {
//                             req.logiIn(user, (err) => {
//                                 done(err, user);
//                             });
//                         });
//                     })
//                 } else {
//                     req.flash("error", "Passwords do not match.");
//                     return res.redirect("back");
//                 }
//             });
//         },
//         function (user, done) {
//             var smtpTransport = nodeMailer.createTransport({
//                 service: "Gmail",
//                 auth: {
//                     // You need to put your own email and password here
//                     user: "test@gmail.com",
//                     pass: "test"
//                 }
//             });
//             var mailOptions = {
//                 to: user.email,
//                 // You need to put your own email here
//                 from: "test@gmail.com",
//                 subject: "Your password has been changed!",
//                 text: "Hello,\n\n" +
//                       "This is a confirmation that the password for your account " + user.email + " has just changed."
//             };
//             smtpTransport.sendMail(mailOptions, (err) => {
//                 req.flash("success", "Your password has been changed!");
//                 done(err);
//             });
//         }
//     ], (err) => {
//         res.redirect("/places");
//     });
// });

// user profile
router.get("/users/:id", async (req, res) => {
    try {
        var user = await User.findById(req.params.id).populate("followers").exec();
        res.render("profile", {user: user});
    } catch (err) {
        req.flash("error", err.message);
        return res.redirect("back");
    }
});

// follow user
router.get("/follow/:id", middleware.isLoggedIn, async (req, res) => {
    try {
        var user = await User.findById(req.params.id);
        user.followers.push(req.user._id);
        user.save();
        req.flash("success", "Successfully followed " + user.username + "!");
        res.redirect("/users/" + req.params.id);
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("back");
    }
});

// view all notifications
router.get("/notifications", middleware.isLoggedIn, async (req, res) => {
   try {
       var user = await User.findById(req.user.id).populate({
           path: "notifications",
           options: {sort: {"_id": -1}}
       }).exec();
       var allNotifications = user.notifications;
       res.render("notifications/index", {allNotifications: allNotifications});
   } catch (err) {
       req.flash("error", err.message);
       res.redirect("back");
   }
});

// handle notifications
router.get("/notifications/:id", middleware.isLoggedIn, async(req, res) => {
   try {
       var notification = await Notification.findById(req.params.id);
       notification.isRead = true;
       notification.save();
       res.redirect("/places/" + notification.placeId)
   } catch (err) {
       req.flash("error", err.message);
       res.redirect("back")
   }
});

module.exports = router;