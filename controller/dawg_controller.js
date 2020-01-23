// Require dependencies
var db = require("./models");
var cheerio = require("cheerio");
var axios = require("axios");


// Export routes
module.exports = function (app) {
    // A GET route for scraping Dawgnation Website
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with axios
        axios.get("http://www.dawgnation.com/").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data);

            // Now, we grab every h2 within an article tag, and do the following:
            $("h2.cm-stream__headline").each(function (i, element) {

                // Save an empty result object
                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(element)
                    .find("a")
                    .text()
                    .trim();
                console.log(result.title);
                result.url = $(element)
                    .children()
                    .attr("href");
                console.log(result.url);
                result.summary = $(element)
                    .siblings("p")
                    .text()
                    .trim();
                console.log(result.summary);

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

    app.get("/", function (req, res) {
        db.Article.find({}, null, { sort: { date: -1 } }, function (err, data) {
            if (data.length === 0) {
                res.render("message", { message: "Please click button above to scrape for new articles" })
            }
            else {
                res.render("index", { articles: data });
            }
        });
    });

    // Populate article with a note
    app.get("/:id", function (req, res) {
        db.Article.findOne({ "_id": req.params.id })
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

    // Route for saving/updating Headline's associated Note
    app.post("/:id", function (req, res) {
        // Create a new comment and pass the req.body to the entry
        db.Note.create(req.body).then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ "_id": req.params.id }, { "notes": dbNote._id }, { new: true });
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
            }).catch(function (err) { res.json(err) });
    });

    // Unsave an article
    app.post("/delete/:id", function (req, res) {
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
};