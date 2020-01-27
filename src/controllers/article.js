const express = require("express");
const { Article, Note } = require("../models")

module.exports = (() => {
    const articles = express.Router();

    articles.get("/", (req, res) => {
        Article.find({})
        .populate("Note")
        .then(data => {
            res.render("views/index", { data })
        })
        .catch(err => res.json(err))
    });

    articles.get("/note/:id", (req, res) => {
        console.log(req.params.id);
        
        Article.findOne({ _id: req.params.id })
        .populate("Note")
        .then((dbReview) => {
            console.log(dbReview.comments);
            res.render("views/saved", {articles: req.params.id, notes: dbArticle.notes})
        })
    })

    return articles;
})();