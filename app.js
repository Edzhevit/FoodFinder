var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/food_finder", {useNewUrlParser: true});

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// SCHEMA SETUP
var restaurantSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

var Restaurant = mongoose.model("Restaurant", restaurantSchema);

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/restaurants", (req, res) => {
    // Get all restaurants from DB
    Restaurant.find({}, (err, allRestaurants) => {
        if(err){
            console.log(err);
        } else{
            res.render("index", { restaurants: allRestaurants});
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
    res.render("new");
});

app.get("/restaurants/:id", (req, res) => {
    // find restaurant with provided ID
    Restaurant.findById(req.params.id, (err, foundRestaurant) => {
        if(err){
            console.log(err)
        } else{
            // render show template with that restaurant
            res.render("show", {restaurant: foundRestaurant})
        }
    });
  
});

app.listen("3000", () => {
    console.log("FoodFinder server has started!")
});