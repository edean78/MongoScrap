var express = require("express");
var logger = require('morgan');
var mongoose = require("mongoose");

// Scrapping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require models
var db = require("./models");

// Connect to the Mongo DB
var databaseURL = "mongodb://localhost:27017/mongoscrap";
// If deployed, use the deployed database, otherwise use the local BulldawgArticles database
var MONGODB_URI = process.env.MONGODB_URI || databaseURL;

//Connect to the Mongo DB
mongoose.connect(MONGODB_URI);

// Initialize Express
var app = express();

// Assign a port
var PORT = process.env.PORT || 3000;

// Use morgan logger for logging requests
app.use(logger("dev"));
// Make public a static folder
app.use(express.static("public"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

// Routes

app.get("/", function (req, res) {
    db.Article.find({}, { sort: { created: -1 } }, function (err, data) {
    });
});

// A GET route for scraping Fox News Website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("http://www.dawgnation.com/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("li.cm-stream__item").each(function (i, element) {

            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            var article = $(element).find("h2").find("a").text().trim();
            var summary = $(element).find("p")
            var url = $(element).find("a").attr("href");

            result.article = article;
            result.summary = summary;
            result.url = url;

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for getting all Arcticles from the db
app.get("/artcles", function (req, res) {
    // Grab every everdocument in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If successful, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // .. and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If successful, send it to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating Headline's associated Comment
app.post("/articles/:id", function (req, res) {
    // Create a new comment and pass the req.body to the entry
    db.Note.create(req.body).then(function (dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ id: req.params.id }, { comment: dbNote._id }, { new: true });
    })
        .then(function (dbArticle) {
            // If we were able to successfully update an Headline, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occured, send it to the client
            res.json(err);
        });
});

