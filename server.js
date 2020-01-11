import { Mongoose } from "mongoose";

// If deployed, use the deployed database, otherwise use the local mongodbHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

//Connect to the Mongo DB
Mongoose.connect(MONGODB_URI);