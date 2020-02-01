var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LogalStrategy = require("passport-local");
var expressSession = require("express-session");
var Restaurant = require("./models/restaurant");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDb = require("./seeds");
var authRoutes = require("./routes/index");
var restaurantRoutes = require("./routes/restaurants");
var commentRoutes = require("./routes/comments");

mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/food_finder", {useNewUrlParser: true});

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

seedDb();

app.use(expressSession({
    secret: "Favourite place is Sofia!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LogalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

app.use(authRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/restaurants/:d/comments", commentRoutes);

app.listen("3000", () => {
    console.log("FoodFinder server has started!")
});