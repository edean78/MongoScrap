// Add Dependencies
require("dotenv").config();
const express = require("express");
const logger = require('morgan');
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");

// Assign a port
const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

const db = require("./src/models");

// Use handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make public a static folder
app.use(express.static(__dirname + "./src/public"));

// express routings
let { news, api } = require("./src/controllers/index");
app.use("/news", reviews);
app.use("/api", api);

app.use("/", (req, res) => {
    res.redirect("/news")
});

// Connect to the Mongo DB
// If deployed, use the deployed database, otherwise use the local BulldawgArticles database
var databaseUrl = "mongodb://localhost:27017/scrapingArticles";

var MONGODB_URI = process.env.MONGODB_URI || databaseUrl;

//Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// Routes

// Route for getting all Articles from the db
// app.get("/articles", function(req, res) {
//     // Grab every document in the Articles collection
//     db.Article.find({}, null, {sort: {date: -1}}, function(err, data){
//         if(data.length === 0) {
//             res.render("message", {message: "Please click Get Dawg News button to receive new articles"})
//         }
//         else {
//             var hbsObject = { articles: data };
//             res.render("index", hbsObject)
//         }
//     });
// });

// Display all articles
app.get("/", function (req, res) {
    db.Article.find({}, null, {sort: {date: -1}}, function(err, data){
        if(data.length === 0) {
            res.render("message", {message: "Please click Get Dawg News button to receive new articles"})
        }
        else {
            var hbsObject = { articles: data };
            res.render("index", hbsObject)
        }
    });
});

// A GET route for scraping Dawgnation Website
app.get("/scrape", function (req, res) {

    // First, we grab the body of the html with request
    request("http://www.dawgnation.com/", function (error, response, html) {

        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);

        // Now, we grab every h2 within an article tag, and do the following:
        $("h2.cm-stream__headline").each(function (i, element) {

            // Define a result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            var title = $(element)
                .find("a")
                .text()
                .trim();
            console.log(result.title);
            var url = $(element)
                .children()
                .attr("href");
            console.log(result.url);
            var summary = $(element)
                .siblings("p")
                .text()
                .trim();
            console.log(result.summary);

            result.title = title;
            result.summary = summary;
            result.url = url;

            // var entry = new db.Article(result);
            //     db.Article.find({title: result.title}, function(err, data){
            //         if (data.length === 0) {
            //             entry.save(function(err, data){
            //                 if (err) throw err;
            //             });
            //         }
            //     });

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });

        // Send a message to the client
        console.log("Scrape Complete");
        res.redirect("/");
    });
});



// Populate article with a note
app.post("saved/:id", function (req, res) {
    Article.findOne({ "_id": req.params.id })
        .populate("notes")
        .then(function (result) {
            // If successful, send it to the client
            res.json(result);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating Article's associated Note
app.post("/note/:id", function (req, res) {
    // Create a new comment and pass the req.body to the entry
    db.Note.create(req.body).then(function (dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ "_id": req.params.id }, { "notes": dbNote._id }, { new: true });
    })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
            res.redirect("saved");
        })
        .catch(function (err) {
            // If an error occured, send it to the client
            res.json(err);
        });
});

// Display saved articles
app.get("/saved", function (req, res) {
    db.Article.find({ "saved": true })
        .populate("notes")
        .then(function (result) {
            var hbsObject = { articles: result };
            res.render("saved", hbsObject);
        }).catch(function (err) { res.json(err) });
});

// Submit saved articles
app.post("/saved/:id", function (res, res) {
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "$set": { "saved": true } })
        .then(function (result) {
            res.json(result);
            res.redirect("/saved");
        }).catch(function (err) {
            res.json(err);
            res.redirect("/");
        });
});

// Unsave an article
app.post("/unsave/:id", function (req, res) {
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "$set": { "saved": false } })
        .then(function (result) {
            res.json(result);
        }).catch(function (err) {
            res.json(err);
        });
});

// Deletes 1 note
app.post("/deleteNote/:id", function (req, res) {
    db.Note.remove({ "_id": req.params.id })
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.json(err)
        });
});

// Starting the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});