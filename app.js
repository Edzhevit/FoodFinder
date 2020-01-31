var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Restaurant = require("./models/restaurant");
var Comment = require("./models/comment");
var seedDb = require("./seeds");

mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/food_finder", {useNewUrlParser: true});

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

seedDb();

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/restaurants", (req, res) => {
    // Get all restaurants from DB
    Restaurant.find({}, (err, allRestaurants) => {
        if(err){
            console.log(err);
        } else{
            res.render("restaurants/index", { restaurants: allRestaurants});
        }
    });
});

app.post("/restaurants", (req, res) => {
    // get data from form and add to restaurants array
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newRestaurant = { name: name, image: image, description: description };
    // create a new restaurant and save it to DB
    Restaurant.create(newRestaurant, (err, newlyCreated) => {
        if(err){
            console.log(err);
        } else{
            // redirect back to restaurants
            res.redirect("/restaurants");
        }
    });
});

app.get("/restaurants/new", (req, res) => {
    res.render("restaurants/new");
});

app.get("/restaurants/:id", (req, res) => {
    // find restaurant with provided ID
    Restaurant.findById(req.params.id).populate("comments").exec((err, foundRestaurant) => {
        if(err){
            console.log(err)
        } else{
            // render show template with that restaurant
            res.render("restaurants/show", {restaurant: foundRestaurant});
        }
    });
  
});

app.get("/restaurants/:id/comments/new", (req, res) => {
    Restaurant.findById(req.params.id, (err, restaurant) =>{
        if(err){
            console.log(err);
        } else{
            res.render("comments/new", {restaurant: restaurant})
        }
    })
});

app.post("/restaurants/:id/comments", (req, res) => {
    Restaurant.findById(req.params.id, (err, restaurant) =>{
        if(err){
            console.log(err);
            req.redirect("/restaurants")
        } else{
            Comment.create(req.body.comment, (err, comment) => {
                if(err){
                    console.log(err);
                } else{
                    restaurant.comments.push(comment);
                    restaurant.save();
                    res.redirect("/restaurants/" + restaurant.id);
                }
            })
        }
    })
});

app.listen("3000", () => {
    console.log("FoodFinder server has started!")
});