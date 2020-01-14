var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Scrapping tools
var axios = require("axios");
var cheerio = require("cherrio");

// Require models
var db = require("./models");

// Assign a port
var PORT = 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
// import { Mongoose } from "mongoose";

// If deployed, use the deployed database, otherwise use the local mongodbHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

//Connect to the Mongo DB
Mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping Fox News Website
app.get("/scrape", function(req, res){
    // First, we grab the body of the html with axios
    axios.get("http://www.foxnews.com/").then(function(response){
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article h2").each(function(i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.headline = $(this).children("a").text();
            result.url = $(this).children("a").attr("href");

            db.Headline.create(result).then(function(dbHeadline){
                console.log(dbHeadline);
            })
            .catch(function(err){
                console.log(err);
            });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for gettin all Headlines from the db
app.get("/headline", function(req, res){
    // Finish the route so it grabs all of the headlines
    db.Headline.find({})
    .then(function(dbHeadline){
        console.log(dbHeadline);
    })
    .catch(function(err){
        console.log(err);
    });
});

app.get("/headline/:id", function(req, res){
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Headline.findOne({_id: req.params.id})
    // .. and populate all of the notes associated with it
    .populate("comment")
    .then(function(dbHeadline){
        // If an error occured, send it to the client
        res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});