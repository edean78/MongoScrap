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

// Use handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make public a static folder
app.use(express.static("./public"));

// express routings
let { articles, api } = require("./src/controllers/index");
app.use("/articles", articles);
app.use("/api", api);

app.use("/", (req, res) => {
    res.redirect("/articles")
});

// Connect to the Mongo DB
// If deployed, use the deployed database, otherwise use the local BulldawgArticles database
var databaseUrl = "mongodb://localhost:27017/scrapingArticles";

var MONGODB_URI = process.env.MONGODB_URI || databaseUrl;

//Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// Starting the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});