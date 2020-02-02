var mongoose = require("mongoose");
var Restaurant = require("./models/restaurant");
var Comment   = require("./models/comment");
 
var data = [
    {
        name: "Cloud's Rest", 
        image: "https://www.tripsavvy.com/thmb/WzbY1hD9IUUI2Y1WIEyvlYB8TWQ=/960x0/filters:no_upscale():max_bytes(150000):strip_icc()/26-5adafa56c6733500373c3cf5.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Desert Mesa", 
        image: "https://lh3.googleusercontent.com/proxy/w7EgkkZUl-uPJQzbESR7iNWbihuJwEdhoYERr_YA9og85fMN2JvO5eUGJokTJxzPKjg2Cqh5EFlbTGI8LtvB-57_J5bXt4YrDcFW0aAHlRpT2D2uw2TF2YrkPspZ7hTSRtwwaw",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Canyon Floor", 
        image: "https://assets3.thrillist.com/v1/image/1224994/size/tmg-article_default_mobile.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    }
];
 
async function seedDB(){
    try{
        await Restaurant.deleteMany({});
        console.log("Restaurants removed");
        await Comment.deleteMany({});
        console.log("Comments removed");
    
        for(var seed of data){
            var restaurant = await Restaurant.create(seed);
            console.log("Restaurant created");
            var comment = await Comment.create(
                {
                    text: "This place is great, but I wish there was internet",
                    author: "Homer"
                }
            );
            console.log("Comment created");
            restaurant.comments.push(comment);
            restaurant.save();
            console.log("Comment added to campground");
        }
    } catch (err){
        console.log(err);
    }
    
}
 
module.exports = seedDB;