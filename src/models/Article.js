var mongoose = require("mongoose");

// Save a refernce to the Schema constructor
var Schema = mongoose.Schema;

// Create a new UserSchema object
var ArticleSchema = new Schema({
    // 'headline' is required and of the type String
    title: {
        type: String,
        unique: true
    },
    // 'summary' is required and of type String
    summary: {
        type: String,
    },
    // 'URL' is required and of type String
    url: {
        type: String,
    },
    saved: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    // 'comment' is an object that stores a Comment id
    // The ref property links the ObjectId to the Comment model
    // This allows us to populate tghe Article with an associated Comment
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
      }
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Ecport the Headline model
module.exports = Article;