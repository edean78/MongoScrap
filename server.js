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

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});