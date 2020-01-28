var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");

var restaurants = [
    {
        name: "Paris Eiffel Tower",
        image: "https://i.pinimg.com/originals/69/10/20/691020528ff605e9ddef80ae22ea239a.jpg"
    },
    {
        name: "Cave Groffa",
        image: "https://bossluxury.files.wordpress.com/2014/04/10151772_859088060773502_892807270_n.jpg"
    },
    {
        name: "The Griffi Palace",
        image: "https://amp.businessinsider.com/images/55bfd5b62acae70f008bcb27-1136-852.jpg"
    },
    {
        name: "Paris Eiffel Tower",
        image: "https://i.pinimg.com/originals/69/10/20/691020528ff605e9ddef80ae22ea239a.jpg"
    },
    {
        name: "Cave Groffa",
        image: "https://bossluxury.files.wordpress.com/2014/04/10151772_859088060773502_892807270_n.jpg"
    },
    {
        name: "The Griffi Palace",
        image: "https://amp.businessinsider.com/images/55bfd5b62acae70f008bcb27-1136-852.jpg"
    },
    {
        name: "Paris Eiffel Tower",
        image: "https://i.pinimg.com/originals/69/10/20/691020528ff605e9ddef80ae22ea239a.jpg"
    },
    {
        name: "Cave Groffa",
        image: "https://bossluxury.files.wordpress.com/2014/04/10151772_859088060773502_892807270_n.jpg"
    },
    {
        name: "The Griffi Palace",
        image: "https://amp.businessinsider.com/images/55bfd5b62acae70f008bcb27-1136-852.jpg"
    },
];

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/restaurants", (req, res) => {

    res.render("restaurants", {restaurants:restaurants});
});

app.post("/restaurants", (req, res) =>{
    // get data from form and add to restaurants array
    var name = req.body.name;
    var image = req.body.image;
    var newRestaurant = {name: name, image: image};
    restaurants.push(newRestaurant);
    // redirect back to restaurants
    res.redirect("/restaurants");
});

app.get("/restaurants/new", (req, res) => {
    res.render("new.ejs");
});

app.listen("3000", () => {
    console.log("FoodFinder server has started!")
});