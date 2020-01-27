const express = require("express");
const { Article, Note } = require("../models/index");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports(() => {
    const api = express.Router();

    // Display all articles
    api.get("/articles", (req, res) => {
        Article.find({})
            .then(data => {
                if (data.length === 0) {
                    res.render("message", { message: "Please click Get Dawg News button to receive new articles" })
                }
                else {
                    let hbsObject = { news: data };
                    res.render("index", hbsObject)
                };
            })
            .catch(err => {
                res.json(err);
            });

    });

    // A GET route for scraping Dawgnation Website
    api.get("/scrape", (req, res) => {

        // First, we grab the body of the html with request
        axios.get("http://www.dawgnation.com/")
            .then(function (response) {

                return cheerio.load(response.data);
            })
            .then(function ($) {
                // Create an array to hold the scraped data
                let _articles = [];

                // Now, we grab every h2 within an article tag, and do the following:
                $("h2.cm-stream__headline").each(function (i, element) {

                    // Add the text and href of every link, and save them as properties of the result object
                    _articles.push = ({
                        title:
                            $(element)
                                .find("a")
                                .text()
                                .trim(),
                        url: $(element)
                            .children()
                            .attr("href"),
                        summary: $(element)
                            .siblings("p")
                            .text()
                            .trim(),

                    });
                });

                return _articles;
            })
            .then(async function(_articles) {
                let articles_doc = [];

                for(let i = 0; i < _articles.length; i++) {
                    const el = _articles[i];

                    articles_doc.push(await Article.create(el));
                }
                return articles_doc;
            })

            .then(_articles => res.json(_articles))
            .catch(err => {
                res.status(400).end();
                if (err) throw err;
            });
    });

    api.post("/note", (req, res) => {

        Note.create(req.body)
        .then (dbNote => {
            return Article.findByIdAndUpdate(req.body.article, {
                $push: { notes: dbNote.id }
            });
        })
        .then(() => res.redirect("/articles"));
    });

    return api;

})();