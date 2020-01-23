// Add Dependencies
require("dotenv").config();
var express = require("express");
var logger = require('morgan');
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var method = require("method-override");

// Require routes from controller
app.require("./controller/dawg_controller.js");

// Initialize Express
var app = express();

// Assign a port
var PORT = process.env.PORT || 3000;

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Method Override
app.use(method("_method"));
// Make public a static folder
app.use(express.static(__dirname + "/public"));

// Connect to the Mongo DB
// var databaseURL = "mongodb://localhost:27017/mongoscrap";
// If deployed, use the deployed database, otherwise use the local BulldawgArticles database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mongoscrap";

//Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Starting the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});